
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
import {useCreateCompany, useGetCompany} from "@/api/Company.api.ts";
import CompanyForm from "@/components/Forms/CompanyForm.tsx";
import {CompanyTable} from "@/components/Tables/CompanyTable.tsx";


const Companies = () => {
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

  const {create, response, isSuccess} = useCreateCompany()
  const {data, refetch} = useGetCompany(searchParams)


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
            <h1 className="text-2xl font-bold tracking-tight text-business-800">Компании</h1>
            <p className="text-muted-foreground mt-1">Обработчик для работы с Компаниями</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger>
              <Button asChild>
                <div>
                  <PlusCircle className="h-4 w-4 mr-1"/>
                  {"Добавить Компанию"}
                </div>
              </Button>
            </DialogTrigger>


            <DialogContent>
              <DialogHeader>
                <DialogTitle>Компании</DialogTitle>
                <DialogDescription>
                  Обработчик для работы с Компаниями
                </DialogDescription>
              </DialogHeader>
              <div>
                <CompanyForm response={response?.response} onCancel={() => setOpen(false)} onCreate={create}
                               status={response?.status}/>
              </div>
            </DialogContent>
          </Dialog>

        </div>

        <div className="rounded-md border bg-white">

          <CompanyTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                          refetch={() => refetch()}/>


        </div>
      </>
  );
};

export default Companies;
