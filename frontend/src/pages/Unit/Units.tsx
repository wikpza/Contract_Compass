
import React, {useEffect, useState} from 'react';
import { PageHeader } from '@/components/PageHeader.tsx';
import {SearchParams, Unit} from '@/types';
import {useCreateUnit, useGetUnits, useUpdateUnit} from "@/api/Unit.api.ts";
import {UnitTable} from "@/components/Tables/UnitTable.tsx";
import {cn} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";
import {PlusCircle} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import UnitForm from "@/components/Forms/UnitForm.tsx";

const Units = () => {
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
  const {create, response, isSuccess} = useCreateUnit()
  const {data, refetch} = useGetUnits(searchParams)

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
                  <h1 className="text-2xl font-bold tracking-tight text-business-800">Единицы измерения</h1>
                  <p className="text-muted-foreground mt-1">Обработчик для работы с единицами измерениями</p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>

                  <DialogTrigger>
                      <Button asChild>
                          <div>
                              <PlusCircle className="h-4 w-4 mr-1"/>
                              {" добавить единицу измерения"}
                          </div>
                      </Button>
                  </DialogTrigger>


                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Единицы измерения</DialogTitle>
                          <DialogDescription>
                              Обработчик для работы с единицами измерениями
                          </DialogDescription>
                      </DialogHeader>
                      <div>
                          <UnitForm response={response?.response} onCancel={()=>setOpen(false)} onCreate={create} status={response?.status}/>
                      </div>
                  </DialogContent>
              </Dialog>

          </div>

          <div className="rounded-md border bg-white">
              <UnitTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                         refetch={() => refetch()}/>
          </div>


      </>
  );
};

export default Units;
