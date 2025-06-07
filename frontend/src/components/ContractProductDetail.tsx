import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Box, CheckCircle, Package, XCircle} from "lucide-react";
import {useGetProducts} from "@/api/Product.api.ts";
import {SearchParams} from "@/types";
import {useAddProductContractType, useGetProductInventory} from "@/api/Inventory.api.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import ProductInventoryForm from "@/components/Forms/ProductInventoryForm.tsx";
import {ProductInventoryTable} from "@/components/Tables/ProductInventoryTable.tsx";

type Props = {
    contractId:number
}
const ContractProductDetail = ({contractId}:Props) => {
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
    const {data, isLoading, refetch} = useGetProductInventory({...searchParams, contractId})
    const {response, create, isSuccess} = useAddProductContractType()
    const [openDialog, setOpenDialog] = useState<null | number>(null)


    useEffect(() => {
        if (isSuccess && response && response?.status === 201) {
            refetch();
            setOpenDialog(null);
        }

    }, [isSuccess]);

    if(!data) return <div>Невозможно загрузить данные</div>


    return (
        <div>
              <Card className="mb-6">
                <CardHeader className={'flex flex-row justify-between'}>
                    <div className={'w-fit'}>
                        <CardTitle>Товары</CardTitle>
                        <CardDescription>Обзор товаров входящих в контракт</CardDescription>
                    </div>
                    <div className={'w-fit'}>
                        <Dialog open={openDialog === contractId} onOpenChange={()=>setOpenDialog(openDialog?null:contractId)}>
                            <DialogTrigger asChild>
                                <Button >
                                    <Box/>
                                    Добавить товар
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Добавить товары</DialogTitle>
                                    <DialogDescription>
                                        Работы с товарами
                                    </DialogDescription>
                                </DialogHeader>
                               <DialogContent>

                                   <ProductInventoryForm status={response?.status} response={response?.response} onCancel={()=>setOpenDialog(null)} contractId={contractId} onCreate={create}/>

                               </DialogContent>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-md flex items-center">
                      <div className="bg-green-100 rounded-full p-3 mr-3">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600">Кол-во товаров</p>
                        <p className="text-xl font-semibold">{data?.data?.count} types</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md flex items-center">
                      <div className="bg-blue-100 rounded-full p-3 mr-3">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600">Общее количество</p>
                        <p className="text-xl font-semibold">
                            {data?.data?.totalCount}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-md flex items-center">
                      <div className="bg-amber-100 rounded-full p-3 mr-3">
                        <XCircle className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-amber-600">Осталось</p>
                        <p className="text-xl font-semibold">
                          {/*{productContract.contractProducts.reduce((sum, product) => sum + (product.quantity - product.deliveredQuantity), 0)} units*/}
                            {data?.data?.lastCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

        <Card>
          <CardHeader>
            <CardTitle>Продукты по Контракту</CardTitle>
            <CardDescription>Товары, которые входят в контракт</CardDescription>
          </CardHeader>
          <CardContent>
              <ProductInventoryTable searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data} refetch={refetch}
              contractId={contractId}/>
          </CardContent>

        </Card>


            {/*{contract.type === 'service' && serviceContract && (*/}
            {/*  <Card>*/}
            {/*    <CardHeader>*/}
            {/*      <CardTitle>Service Details</CardTitle>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*      <p className="text-business-600">{serviceContract.description}</p>*/}
            {/*    </CardContent>*/}
            {/*  </Card>*/}
            {/*)}*/}

        </div>
    );
};

export default ContractProductDetail;