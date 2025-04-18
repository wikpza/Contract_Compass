
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
import {ApplicantTable} from "@/components/Tables/ApplicantTable.tsx";
import ApplicantForm from "@/components/Forms/ApplicantForm.tsx";
import {useCreatePurchaser, useGetPurchasers} from "@/api/Purchaser.api.ts";
import {PurchaserTable} from "@/components/Tables/PurchaserTable.tsx";
import PurchaserForm from "@/components/Forms/PurchaserForm.tsx";


const Purchasers = () => {
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

  const {create, response, isSuccess} = useCreatePurchaser()
  const {data, refetch} = useGetPurchasers(searchParams)


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
            <h1 className="text-2xl font-bold tracking-tight text-business-800">Закупщики</h1>
            <p className="text-muted-foreground mt-1">Обработчик для работы с Закупщиками</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger>
              <Button asChild>
                <div>
                  <PlusCircle className="h-4 w-4 mr-1"/>
                  {"Добавить Закупщика"}
                </div>
              </Button>
            </DialogTrigger>


            <DialogContent>
              <DialogHeader>
                <DialogTitle>Закупщики</DialogTitle>
                <DialogDescription>
                  Обработчик для работы с Закупщиками
                </DialogDescription>
              </DialogHeader>
              <div>
                <PurchaserForm response={response?.response} onCancel={() => setOpen(false)} onCreate={create}
                               status={response?.status}/>
              </div>
            </DialogContent>
          </Dialog>

        </div>

        <div className="rounded-md border bg-white">

          <PurchaserTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                          refetch={() => refetch()}/>


        </div>
      </>
  );
};

export default Purchasers;
