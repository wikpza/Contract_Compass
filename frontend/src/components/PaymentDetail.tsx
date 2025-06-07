import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {DollarSign, History, HandCoins} from "lucide-react";
import {formatCurrency} from "@/utils/helpers.ts";
import {Progress} from "@/components/ui/progress.tsx";
import {ContractPaymentHistoryTable} from "@/components/Tables/ContractPaymentHistory";
import {SearchParams} from "@/types";
import {useCreatePayment, useFinishPayment, useGetPayments} from "@/api/Payment.api.ts";
import {GetContractType} from "@/types/Contract.ts";
import PaymentForm from "@/components/Forms/PaymentForm.tsx";
import FinishPaymentForm from "@/components/Forms/FinishPaymentForm.tsx";

type Props = {
    contract:GetContractType,
    contractAmount:number,
    paidAmount:number,
    contractCurrency:{id:number, name:string, symbol:string, code:string},
    refetch:()=>void
}
const PaymentDetail = ({contractAmount, contract, paidAmount, contractCurrency, refetch}:Props) => {
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

  const {create, response, isSuccess} = useCreatePayment()
  const {data, refetch:paymentHistoryRefetch} = useGetPayments(searchParams)
  const {response:finishResponse, create:finishPayment, isSuccess:isFinisSuccess} = useFinishPayment()
  const [tab, setTab] = useState("history");

  useEffect(() => {
    if (
        (isSuccess && response && response?.status === 201) ||
        (isFinisSuccess && finishResponse && finishResponse?.status === 201)
    ) {
      refetch();
      paymentHistoryRefetch();
      setTab("history")
    }



  }, [isSuccess, isFinisSuccess]);

  return (

        <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Транзакции</CardTitle>
                <CardDescription>Просмотр историй пополнений</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList>

                    <TabsTrigger value="history" className="flex items-center">
                      <History className="h-4 w-4 mr-2" />
                     История оплат
                    </TabsTrigger>

                    <TabsTrigger value="add" className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Совершить транзакцию
                    </TabsTrigger>

                    <TabsTrigger value="finish" className="flex items-center">
                      <HandCoins className="h-4 w-4 mr-2" />
                      Доплатить остаток
                    </TabsTrigger>

                  </TabsList>

                  <TabsContent value="history" className="pt-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Сумма контракта</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {formatCurrency(contractAmount, contractCurrency.code, contractCurrency.symbol)}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Выплаченная сумма</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(paidAmount, contractCurrency.code, contractCurrency.symbol)}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Осталось</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(contractAmount - paidAmount, contractCurrency.code, contractCurrency.symbol)}
                            </div>
                            <div className="mt-2">
                              <Progress value={ (contractAmount !== 0 ? Number((paidAmount*100/contractAmount).toFixed(2)) : 0)} className="h-2" />
                              <div className="text-xs mt-1 text-right">
                                {(contractAmount !== 0 ?( paidAmount*100/contractAmount).toFixed(2) : 0)}% оплачено
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <ContractPaymentHistoryTable  searchParams={searchParams} setSearchParams={setSearchParams} data={data?.data}
                                                    contract={contract}
                      refetch={()=>{
                        refetch()
                        paymentHistoryRefetch()
                      }}/>
                    </div>
                  </TabsContent>

                  <TabsContent value="add" className="pt-4">
                    <div className="max-w-md mx-auto">
                     <PaymentForm contract={contract} response={response?.response} onCreate={create} status={response?.status} />
                    </div>
                  </TabsContent>

                  <TabsContent value="finish" className="pt-4">
                    <div className="max-w-md mx-auto">
                      <FinishPaymentForm contract={contract} response={finishResponse?.response} onCreate={finishPayment} status={finishResponse?.status} lastSum={`${contract.amount - contract.giveAmount} ${contract.currency.symbol}`} />
                    </div>
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>
        </div>
    );
};

export default PaymentDetail;