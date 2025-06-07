
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

import {CurrencyTable} from "@/components/Tables/CurrencyTable.tsx";
import {useCreateCurrency, useGetCurrency} from "@/api/Currency.api.ts";
import CurrencyForm from "@/components/Forms/CurrencyForm.tsx";


const Currencies = () => {
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

  const {create, response, isSuccess} = useCreateCurrency()
  const {data, refetch} = useGetCurrency(searchParams)


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
            <h1 className="text-2xl font-bold tracking-tight text-business-800">Валюта</h1>
            <p className="text-muted-foreground mt-1">Обработчик для работы с Валютами</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger>
              <Button asChild>
                <div>
                  <PlusCircle className="h-4 w-4 mr-1"/>
                  {"Добавить Валюту"}
                </div>
              </Button>
            </DialogTrigger>


            <DialogContent>
              <DialogHeader>
                <DialogTitle>Валюта</DialogTitle>
                <DialogDescription>
                  Обработчик для работы с Валютами
                </DialogDescription>
              </DialogHeader>
              <div>
                <CurrencyForm response={response?.response} onCancel={() => setOpen(false)} onCreate={create}
                               status={response?.status}/>
              </div>
            </DialogContent>
          </Dialog>

        </div>

        <div className="rounded-md border bg-white">
          <CurrencyTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                          refetch={() => refetch()}/>
        </div>
      </>
  );
};

export default Currencies;
