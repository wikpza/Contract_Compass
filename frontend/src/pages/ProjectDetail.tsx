import React, {useEffect, useMemo, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  projects, 
  productContracts, 
  serviceContracts,
  applicants,
  purchasers,
  companies
} from '@/data/mockData';
import { formatDate, formatCurrency, getPaymentPercentage, getDeliveryPercentage, calculateRemainingBalance, calculateRemainingQuantity } from '@/utils/helpers';
import {
  FileText,
  DownloadCloud,
  ExternalLink,
  AlertCircle,
  DollarSign,
  Clock,
  ShoppingBag,
  Percent,
  Loader, Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/StatCard';
import {useGetProjectDetail, useUpdateProjectStatus} from "@/api/Project.api.ts";
import LoadingPage from "@/components/LoadingPage.tsx";
import UnableToLoadData from "@/pages/ErrorPages/UnableToLoadData.tsx";
import {ContractTable} from "@/components/Tables/ContractTable.tsx";
import {useGetContracts} from "@/api/Contract.api.ts";
import {SearchParams} from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {isFormErrors} from "@/lib/errors";
import {toast} from "sonner";

const ProjectDetail = () => {

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const { id } = useParams();
  const {data, isLoading, isError, refetch:projectRefetch} = useGetProjectDetail({id})
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
  const {data:contracts, refetch} = useGetContracts({...searchParams, projectId:id})
  const {update, isSuccess, response:updateResponse} = useUpdateProjectStatus()

  const response = updateResponse?.response
  const status = updateResponse?.status
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    console.log(isSuccess)
    console.log(response)
    console.log(status)

    if (isSuccess && status === 201) {
      refetch();
      projectRefetch()
      setOpen(false);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (response && isFormErrors(response) && status && status >= 400 && status < 500) {
      const errorFields = Object.keys(response.details)

      errorFields.forEach(field => {
        toast.error(response.details[field].join(", "));
      });

      if (errorFields.length === 0) {
        toast.error(response.message);
      }
    }
  }, [response]);

  if(isLoading) return (<LoadingPage message="Please wait while we load your data..." />)
  if(isError || !data) return (<UnableToLoadData/>)

  return (
      <>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-business-800">
                {data.data.project.name}
              </h1>
              <Badge className={getStatusColor(data?.data.project.status ? 'active' : "cancelled")} variant="outline">
                {/*{project.status.charAt(0).toUpperCase() + project.status.slice(1)}*/}
                {data?.data.project.status ? 'active' : "finished"}
              </Badge>
            </div>
            <p className="text-business-500 mt-1">{data.data.project?.note}</p>
          </div>

          <div className={'flex align-middle space-x-2'}>
            <Dialog
                open={open}
                onOpenChange={setOpen}>
              <DialogTrigger asChild>

                {data?.data.project.status ?
                    <Button variant="destructive">Завершить проект</Button>
                    :
                    <Button variant="outline">Активировать проект</Button>
                }

              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Статус Проекта</DialogTitle>
                  <DialogDescription>
                    Вы уверены, что хотите изменить статус проекта. Если вы хотите завершить проект, не должно быть
                    активных контрактов
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                </div>
                <DialogFooter>
                  {data?.data.project.status ?
                      <Button
                          onClick={() => update({id: data.data.project.id})}
                          variant="destructive">Завершить проект</Button>
                      :
                      <Button
                          onClick={() => update({id: data.data.project.id})}
                          variant="outline">Активировать проект</Button>
                  }
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button asChild>
              <Link to={`/projects/${id}/contracts/new`}>
                <FileText className="h-4 w-4 mr-2"/>
                Заключить Контракт
              </Link>
            </Button>

          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <StatCard
              title="Выполнение проекта"
              value={`${data?.data?.completedCount === 0 ? 0 : (data?.data?.productCount + data?.data?.serviceCount) / (data?.data?.completedCount)}%`}
              icon={<Percent className="h-5 w-5"/>}
              description="Процент выполненых контраков"
              progress={data?.data?.completedCount === 0 ? 0 : (data?.data?.productCount + data?.data?.serviceCount) / (data?.data?.completedCount)}
          />

          <StatCard
              title="Количество Контрактов"
              value={(data?.data?.productCount + data?.data?.serviceCount)}
              // icon={data?.data?.project?.currency?.symbol}
              description={`Товары - ${(data?.data?.productCount)}; 
              Услуга - ${(data?.data?.serviceCount)}`}
          />

          <StatCard
              title="Всего потрачено"
              value={formatCurrency(data?.data?.totalSpent, data?.data?.project?.currency?.code, data?.data?.project?.currency?.symbol)}
              icon={data?.data?.project?.currency?.symbol}
              description={`${formatCurrency(data?.data?.totalAmount - data?.data?.totalSpent, data?.data?.project?.currency?.code, data?.data?.project?.currency?.symbol)} осталось`}
              progress={getPaymentPercentage(data?.data?.totalAmount, data?.data?.totalSpent)}
          />

          <StatCard
              title="График проекта"
              value={formatDate(data?.data?.project?.finishDate)}
              icon={<Clock className="h-5 w-5"/>}
              description={`Начало ${formatDate(data?.data?.project?.startDate)}`}
          />
        </div>

        {data?.data?.totalProductCount !== 0 && (
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <StatCard
                  title="Product Delivery"
                  value={`${data?.data?.deliveredProductCount === 0 ? 0 : ((data?.data?.totalProductCount) / (data?.data?.deliveredProductCount)).toFixed(2)}%`}
                  icon={<ShoppingBag className="h-5 w-5"/>}
                  description={`${data?.data?.deliveredProductCount} из ${data?.data?.totalProductCount} уже получено`}
                  progress={data?.data?.deliveredProductCount === 0 ? 0 : Number(((data?.data?.totalProductCount) / (data?.data?.deliveredProductCount)).toFixed(2))}
                  progressColor="bg-green-600"
              />

              <StatCard
                  title="Контракты - Товары"
                  value={data?.data?.productCount}
                  icon={<FileText className="h-5 w-5"/>}
                  description={`${data?.data?.serviceCount} Контракт - Услуга `}
              />
            </div>
        )}


        <div className="rounded-md border bg-white">

          <ContractTable project={data.data.project} searchParams={searchParams} setSearchParams={setSearchParams}
                         data={contracts?.data} refetch={() => {
            refetch()
            projectRefetch()
          }
          }/>

        </div>

        {/*<Tabs defaultValue="all" className="mb-6">*/}
        {/*  <TabsList>*/}
        {/*    <TabsTrigger value="all">All Contracts*/}
        {/*      ({(data?.data?.productCount + data?.data?.serviceCount)})</TabsTrigger>*/}
        {/*    <TabsTrigger value="product">Product Contracts ({data?.data?.productCount})</TabsTrigger>*/}
        {/*    <TabsTrigger value="service">Service Contracts ({data?.data?.serviceCount})</TabsTrigger>*/}
        {/*  </TabsList>*/}
        {/*  <TabsContent value="all" className="mt-4">*/}

        {/*  </TabsContent>*/}
        {/*  <TabsContent value="product" className="mt-4">*/}
        {/*    <div className="rounded-md border bg-white">*/}

        {/*      <ContractTable project={data.data.project} searchParams={searchParams} setSearchParams={setSearchParams}*/}
        {/*                     data={contracts?.data} refetch={() => {*/}
        {/*        refetch()*/}
        {/*        projectRefetch()*/}
        {/*      }*/}
        {/*      }/>*/}

        {/*    </div>*/}
        {/*  </TabsContent>*/}
        {/*  <TabsContent value="service" className="mt-4">*/}
        {/*    <div className="rounded-md border bg-white">*/}

        {/*      <ContractTable project={data.data.project} searchParams={searchParams} setSearchParams={setSearchParams}*/}
        {/*                     data={contracts?.data} refetch={() => {*/}
        {/*        refetch()*/}
        {/*        projectRefetch()*/}
        {/*      }*/}
        {/*      }/>*/}

        {/*    </div>*/}
        {/*  </TabsContent>*/}
        {/*</Tabs>*/}


      </>
  );
};

export default ProjectDetail;
