import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

import {

  AlertCircle,
  ArrowLeftCircle, Check,

  Edit,
  Trash,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';
import {useGetContractDetail, useUpdateContractStatus} from "@/api/Contract.api.ts";
import {toast} from "sonner";
import PaymentDetail from "@/components/PaymentDetail.tsx";
import ContractProductDetail from "@/components/ContractProductDetail.tsx";
import FileDetail from "@/components/FileDetail.tsx";
import FileLinkDetail from "@/components/FileLinkDetail.tsx";
import {isFormErrors} from "@/lib/errors";
import {Badge} from "@/components/ui/badge.tsx";

const ContractDetail = () => {
  const {  contractId, projectId } = useParams<{ projectId: string; contractId: string }>();
  const {data:projectData, isLoading, error, refetch} = useGetContractDetail({id:contractId})

  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [showActiveDialog, setShowActiveDialog] = useState<boolean>(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState<boolean>(false);
  const {update, isSuccess, response} = useUpdateContractStatus()


  useEffect(() => {
    if (response && isFormErrors(response.response) && response.status && response.status >= 400 && response.status < 500) {
      const errorFields = Object.keys(response.response.details)
      const details = response.response
      errorFields.forEach(field => {
        toast.error(details.details[field].join(", "));
      });

      if (errorFields.length === 0) {
        toast.error(response.response.message);
      }

    }
  }, [ response]);

  useEffect(() => {
    if (isSuccess && response && response?.status === 201) {
      refetch();
      if(showCancelDialog) setShowCancelDialog(false);
      if(showActiveDialog) setShowActiveDialog(false);
      if(showCompletedDialog)setShowCompletedDialog(false);
    }
  }, [isSuccess]);

  if (!projectData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="h-16 w-16 text-business-300 mb-4" />
        <h2 className="text-2xl font-bold">Контакт не был найден</h2>
        <p className="text-muted-foreground mt-2 mb-6">Контракт, который ты ищешь не удалось найти</p>
        <Button asChild>
          <Link to={`/projects/${projectId}`}>Вернуться к проекту</Link>
        </Button>
      </div>
    );
  }
  

  return (
    <div className={'space-y-4'}>

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-4">
            <Link to={`/projects/${projectData?.data.projectId}`}>
              <ArrowLeftCircle className="h-4 w-4 mr-2" />
             Назад к проекту
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-business-800">
            {projectData?.data?.type === 'product' ? 'Контракт (товар)' : 'Контракт (услуга)'}
          </h1>
        </div>

        <div className="flex space-x-2">



          {
            projectData.data.status !== 'canceled' &&
              (<Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Отменить Контракт
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Отменить Контракт</DialogTitle>
                    <DialogDescription>
                      Вы уверены, что хотите отменить контракт
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      Закрыть окно
                    </Button>
                    <Button variant="destructive"
                            onClick={()=>update({id:projectData.data.id, status:"canceled"})}
                    >
                      Да, отменить контракт
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>)
          }

          {
              projectData.data.status !== 'active' &&
              (<Dialog open={showActiveDialog} onOpenChange={setShowActiveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" asChild>
                <span className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                 Активировать контракт
                </span>
              </Button>

            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Активировать контракт</DialogTitle>
                <DialogDescription>
                  Вы уверен, что хотите активировать контракт
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2 pt-4">

                <Button variant="outline" onClick={() => setShowActiveDialog(false)}>
                 Отмена
                </Button>

                <Button className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={()=>update({id:projectData.data.id, status:"active"})}

                >
                 Да, активировать контракт
                </Button>

              </DialogFooter>
            </DialogContent>
          </Dialog>)
          }

          {
              projectData.data.status !== 'completed' &&
              (<Dialog open={showCompletedDialog} onOpenChange={setShowCompletedDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600 text-white" asChild>
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Завершить контракт
                    </span>
                  </Button>


                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Завершить контракт</DialogTitle>
                    <DialogDescription>
                      Вы уверен, что хотите Завершить контракт
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCompletedDialog(false)}>
                      Отмена
                    </Button>

                    <Button className="bg-green-500 hover:bg-green-600 text-white" asChild
                            onClick={()=>update({id:projectData.data.id, status:"completed"})}
                    >
                    <span className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Завершить контракт
                    </span>
                    </Button>

                  </DialogFooter>
                </DialogContent>
              </Dialog>)
          }


        </div>
      </div>



      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Проект</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold">{projectData.data.project.name}
              <Badge className={projectData?.data.status === 'active'? "bg-green-100 text-green-800" : (projectData?.data.status === 'canceled'? "bg-red-100 text-red-800":"bg-blue-100 text-blue-800")} variant="outline">
                {projectData?.data.status}
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">{projectData.data.project?.note || 'Не добавляли заметку'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Сумма Контракта</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectData.data.amount, projectData.data.currency.code, projectData.data.currency.symbol) }
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Оплачено: { formatCurrency(projectData.data.giveAmount,  projectData.data.currency.code,  projectData.data.currency.symbol) }</span>
                <span>{(projectData.data.giveAmount * 100 / projectData.data.amount).toFixed(2)}%</span>
              </div>
              <Progress value={projectData.data.giveAmount * 100 / projectData.data.amount} className="h-2" />
              <p className="text-sm mt-2">
                Осталось: <span className="font-medium">{ formatCurrency(projectData.data.amount - projectData.data.giveAmount, projectData.data.currency.code,  projectData.data.currency.symbol) }</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Срок действия контракта</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-sm text-business-500">Дата подписания</div>
              <div className="font-medium">{formatDate(projectData.data.officialBeginDate)}</div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-business-500">Дата начала</div>
                <div className="font-medium">{formatDate(projectData.data.officialBeginDate)}</div>
              </div>

              <div className="text-center border-r border-business-200 h-8"></div>
              <div>
                <div className="text-sm text-business-500">Дата завершения</div>
                <div className="font-medium">{formatDate(projectData.data.officialFinishDate)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Описание Контракта</CardTitle>
            <CardDescription>Overview of the contract purpose and terms</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {projectData.data?.note || 'Не добавляли описание'}
        </CardContent>
      </Card>



      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Заявитель</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium">{projectData.data.applicant?.name}</h3>
            <p className="text-sm text-business-500">{projectData.data.applicant?.email || "Не добавляли почту"}</p>
            <p className="text-sm text-business-500">{projectData.data.applicant?.phone || "Не добавляли номер телефона"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Закупщик</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium">{projectData.data.purchaser?.name}</h3>
            <p className="text-sm text-business-500">{projectData.data.purchaser?.email || "Не добавляли почту"}</p>
            <p className="text-sm text-business-500">{projectData.data.purchaser?.phone || "Не добавляли номер телефона"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-business-500">Компания/Фирма</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium">{projectData.data.company?.name}</h3>
            <p className="text-sm text-business-500">{projectData.data.company?.email || "Не добавляли почту"}</p>
            <p className="text-sm text-business-500">{projectData.data.company?.phone || "Не добавляли номер телефона"}</p>
          </CardContent>
        </Card>
      </div>

      <FileDetail contractId={projectData.data.id}/>

      <FileLinkDetail contractId={projectData.data.id}/>

      <PaymentDetail contract={projectData?.data} contractAmount={projectData.data.amount} paidAmount={projectData?.data?.giveAmount} contractCurrency={projectData?.data?.currency} refetch={()=>refetch()}/>

      {projectData.data.type === "product" && (
          <ContractProductDetail contractId={projectData?.data?.id}/>
      )}


    </div>
  );
};

export default ContractDetail;
