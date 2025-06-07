import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {FileText, LinkIcon, PlusCircle, Upload} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {SearchParams} from "@/types";
import {cn} from "@/lib/utils.ts";
import {useAddDocument, useGetFilesVolumes} from "@/api/FileVolume.api.ts";
import {FileVolumeTable} from "@/components/Tables/FileVolumeTable.tsx";
import {toast} from "sonner";
import {isFormErrors} from "@/lib/errors";

type Props = {
    contractId:number
}
const FileDetail = ({contractId}:Props) => {

    const [searchParams, setSearchParams] = useState<SearchParams>(
        {
            searchBy:"name",
            searchValue:"",
            page:1,
            sortBy:"createdAt",
            sortType:"DESC",
            limit:10
        }
    )

    const [open, setOpen] = React.useState(false);

    // const {create, response, isSuccess} = useCreateApplicant()

    const {data, refetch} = useGetFilesVolumes({...searchParams, contractId})
    const {isSuccess, response, create:addDocument} = useAddDocument()

    useEffect(() => {
        refetch()
    }, [searchParams]);

    useEffect(() => {
        if (isSuccess && response && response?.status === 201) {
            refetch();
        }
    }, [isSuccess]);

    useEffect(() => {
        console.log(response)
        if (response && isFormErrors(response) && response.status && response.status >= 400 && response.status < 500) {
            toast.error(response.message);
        }
    }, [response]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            // Проверка на количество файлов
            if (files.length > 10) {
                toast.error("Можно загрузить не более 10 файлов");
                return;
            }

            // Преобразуем FileList в массив File[]
            const filesArray = Array.from(files);
            addDocument({ documents: filesArray, contractId });
        }
    };

    return (
        <div>

            <Card>
                <CardHeader>

                    <div className={cn("flex justify-between items-center mb-6")}>
                        <div>
                            <CardTitle className={'mb-3'}>Документы</CardTitle>
                            <CardDescription>Загружайте файлы, связанные с данным контрактом</CardDescription>
                        </div>
                        <div className="border rounded-md p-4 flex justify-between items-center">
                            <div className="flex items-center mr-2">
                                <FileText className="h-5 w-5 text-business-600 mr-2"/>
                                <div>
                                    <h4 className="text-sm font-medium">Добавить Документ</h4>
                                </div>
                            </div>
                            <div>
                                <Input
                                    id="document-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.webp,.png"
                                    onChange={handleFileUpload}
                                />
                                <Button variant="outline" asChild>
                                    <label htmlFor="document-upload" className="cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2"/>
                                        Upload
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </div>

                </CardHeader>
                <CardContent className="space-y-4">


                    <div className="rounded-md border bg-white">
                        <FileVolumeTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                                        refetch={() => refetch()}/>
                    </div>


                </CardContent>
            </Card>


        </div>
    );
};

export default FileDetail;