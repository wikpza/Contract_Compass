import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {FileText, PlusCircle} from "lucide-react";
import {SearchParams} from "@/types";
import {cn} from "@/lib/utils.ts";
import {toast} from "sonner";
import {isFormErrors} from "@/lib/errors";
import {useCreateFileLink, useGetFileLinks} from "@/api/FileLink.api.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import FileLinkForm from "@/components/Forms/FileLinkForm.tsx";
import {FileLinkTable} from "@/components/Tables/FileLinkTable.tsx";

type Props = {
    contractId:number
}
const FileLinkDetail = ({contractId}:Props) => {

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


    const {data, refetch} = useGetFileLinks({...searchParams, contractId})
    const {isSuccess, response, create} = useCreateFileLink()
    useEffect(() => {
        refetch()
    }, [searchParams]);

    useEffect(() => {
        if (isSuccess && response && response?.status === 201) {
            refetch();
            setOpen(false);
        }
    }, [isSuccess]);

    useEffect(() => {

        if (response && isFormErrors(response) && response.status && response.status >= 400 && response.status < 500) {
            toast.error(response.message);
        }
    }, [response]);


    return (
        <div>

            <Card>
                <CardHeader>

                    <div className={cn("flex justify-between items-center mb-6")}>
                        <div>
                            <CardTitle className={'mb-3'}>Ссылки</CardTitle>
                            <CardDescription>Сохраняйте ссылки на файлы</CardDescription>
                        </div>
                                <Dialog open={open} onOpenChange={setOpen}>

                                    <DialogTrigger>
                                        <Button asChild>
                                            <div>
                                                <PlusCircle className="h-4 w-4 mr-1"/>
                                                {"Добавить Ссылку"}
                                            </div>
                                        </Button>
                                    </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Ссылки</DialogTitle>
                                        <DialogDescription>
                                            Обработчик для работы со ссылками
                                        </DialogDescription>
                                    </DialogHeader>
                                        <FileLinkForm response={response?.response} onCancel={() => setOpen(false)} onCreate={create}
                                                       status={response?.status}
                                                      contractId={contractId}
                                        />
                                </DialogContent>
                            </Dialog>
                    </div>

                </CardHeader>
                <CardContent className="space-y-4">


                    <div className="rounded-md border bg-white">
                        <FileLinkTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                                         refetch={() => refetch()}
                                       contractId={contractId}
                        />
                    </div>


                </CardContent>
            </Card>


        </div>
    );
};

export default FileLinkDetail;