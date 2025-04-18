
import React, {useEffect, useState} from 'react';
import {SearchParams} from "@/types";
import {cn} from "@/lib/utils.ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {PlusCircle} from "lucide-react";
import {useCreateApplicant, useGetApplicants} from "@/api/Applicant.api.ts";
import {ApplicantTable} from "@/components/Tables/ApplicantTable.tsx";
import ApplicantForm from "@/components/Forms/ApplicantForm.tsx";


const Applicants = () => {
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

  const {create, response, isSuccess} = useCreateApplicant()
  const {data, refetch} = useGetApplicants(searchParams)


  useEffect(() => {
    refetch()
  }, [searchParams]);

  useEffect(() => {
    if (isSuccess && response && response?.status === 201) {
      refetch();
      setOpen(false);
    }
  }, [isSuccess]);


  return (
      <>
        <div className={cn("flex justify-between items-center mb-6")}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-business-800">Заявитель</h1>
            <p className="text-muted-foreground mt-1">Обработчик для работы с Заявителями</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger>
              <Button asChild>
                <div>
                  <PlusCircle className="h-4 w-4 mr-1"/>
                  {"Добавить Заявителя"}
                </div>
              </Button>
            </DialogTrigger>


            <DialogContent>
              <DialogHeader>
                <DialogTitle>Заявителями</DialogTitle>
                <DialogDescription>
                  Обработчик для работы с Заявителями
                </DialogDescription>
              </DialogHeader>
              <div>
                <ApplicantForm response={response?.response} onCancel={() => setOpen(false)} onCreate={create}
                          status={response?.status}/>
              </div>
            </DialogContent>
          </Dialog>

        </div>

        <div className="rounded-md border bg-white">
          <ApplicantTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                     refetch={() => refetch()}/>
        </div>
      </>
  );
};

export default Applicants;
