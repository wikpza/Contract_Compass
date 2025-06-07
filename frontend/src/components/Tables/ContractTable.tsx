
import React, {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {Edit, Trash, ArrowUp, ArrowDown, Eye} from 'lucide-react';
import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {SearchParams} from "@/types";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader, DialogOverlay,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import SearchPanel from "@/components/SearchPanel.tsx";
import {GetContractType} from "@/types/Contract.ts";
import ContractForm from "@/components/Forms/ContractForm.tsx";
import {useDeleteContract, useUpdateContract} from "@/api/Contract.api.ts";
import {GetProjectType} from "@/types/Project.ts";
import {useNavigate} from "react-router-dom";
import {Badge} from "@/components/ui/badge.tsx";

type Props = {
    searchParams:SearchParams,
    setSearchParams: (input:SearchParams)=>void
    data:{count:number, rows:GetContractType[]} | undefined,
    refetch: ()=>void,
    project:GetProjectType
}

export function ContractTable({data, refetch, searchParams, setSearchParams, project}:Props) {

    const totalPages = Math.ceil(data?.count / searchParams.limit);
    const columns = [
        {value:"name", name:"Название"},
        {value:"type", name:"Тип контракта"},
        {value:"status", name:"Статус"},
        {value:"applicantId", name:"Заявитель"},
        {value:"purchaserId", name:"Закупщик"},
        {value:"companyId", name:"Компания"},
        {value:"amount", name:"Сумма Контракта"},
        {value:"giveAmount", name:"Выплачено"},
        {value:"signDate", name:"Дата подписания"},
        {value:"officialBeginDate", name:"Дата начала"},
        {value:"officialFinishDate", name:"Дата завершения"}
    ]


    const [openDialogId, setOpenDialogId] = useState<number | null>(null);
    const [openDeleteDialogId, setOpenDeleteDialogId] = useState<number | null>(null);
    const {update, isSuccess:isUpdateSuccess, response:updateResponse} = useUpdateContract()
    const {deleteObj, isSuccess:isDeleteSuccess, data:deleteResponse} = useDeleteContract()
    const getPageLinks = () => {
        const pages = [];

        // Always show first page
        pages.push(
            <PaginationItem key="first">
                <PaginationLink
                    onClick={() =>setSearchParams({...searchParams, page:1})}
                    isActive={searchParams.page === 1}
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );

        // Show ellipsis if needed
        if (searchParams.page > 3) {
            pages.push(
                <PaginationItem key="ellipsis1">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Show current page and adjacent pages
        for (let i = Math.max(2, searchParams.page  - 1); i <= Math.min(totalPages - 1, searchParams.page  + 1); i++) {
            if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => setSearchParams({...searchParams, page:i})}
                        isActive={searchParams.page  === i}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Show ellipsis if needed
        if (searchParams.page < totalPages - 2) {
            pages.push(
                <PaginationItem key="ellipsis2">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        // Always show last page if there are more than 1 page
        if (totalPages > 1) {
            pages.push(
                <PaginationItem key="last">
                    <PaginationLink
                        onClick={() => setSearchParams({...searchParams, page:totalPages})}
                        isActive={searchParams.page === totalPages}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    useEffect(() => {
        if (isUpdateSuccess && updateResponse && updateResponse?.status === 201) {
            refetch();
            setOpenDialogId(null);
        }
        //
        if (isDeleteSuccess && deleteResponse && deleteResponse?.status === 201) {
            refetch();
            setOpenDeleteDialogId(null);
        }
    }, [isUpdateSuccess, isDeleteSuccess]);
    const navigate = useNavigate()

    return (
        <div className="w-full">
            <ScrollArea className=" w-full rounded-md border p-4">
                <SearchPanel searchParams={searchParams} setSearchParams={setSearchParams} columns={columns}/>

                {data?
                    <div
                        className="min-w-[300px]"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>

                                    <TableHead>ID</TableHead>

                                    {columns.map(column=>(
                                        <TableHead
                                            className={searchParams.sortBy === column.value ? 'cursor-pointer' : ''}
                                            onClick={()=>{
                                                if(searchParams.sortBy === column.value) setSearchParams( {...searchParams, sortType: (searchParams.sortType === 'ASC')?'DESC':'ASC'})
                                                else setSearchParams({...searchParams, sortBy:column.value})
                                            }}
                                        >

                                            <div className="flex items-center gap-1">
                                                {column.name}
                                                {searchParams.sortBy === column.value && (
                                                searchParams.sortType === 'ASC'
                                                    ? <ArrowUp className="h-3 w-3"/>
                                                    : <ArrowDown className="h-3 w-3"/>
                                            )}
                                            </div>

                                        </TableHead>
                                    ))}


                                    <TableHead className="text-right">Действие</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            className="h-24 text-center"
                                        >
                                            {data.rows.length === 0
                                                ? (searchParams.searchValue ? "No matching results found" : "No results found")
                                                : "No data for this page"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.rows.map((row, rowIndex) => (
                                        <TableRow key={row.id || rowIndex}>

                                            <TableCell >
                                                {row.id}
                                            </TableCell>

                                            <TableCell >
                                                {row.name}
                                            </TableCell>

                                            <TableCell >
                                                {row.type }
                                            </TableCell>
                                            <TableCell >
                                                <Badge className={row.status === 'active'? "bg-green-100 text-green-800" : (row.status === 'canceled'? "bg-red-100 text-red-800":"bg-blue-100 text-blue-800")} variant="outline">
                                                    {row.status}
                                                </Badge>
                                            </TableCell>

                                            <TableCell >
                                                {row.applicant.name }
                                            </TableCell>

                                            <TableCell >
                                                {row.purchaser.name }
                                            </TableCell>

                                            <TableCell >
                                                {row.company.name }
                                            </TableCell>

                                            <TableCell >
                                                {`${row.amount } ${row.currency.symbol}`}
                                            </TableCell>

                                            <TableCell >
                                                {`${row.giveAmount } ${row.currency.symbol}`}
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.signDate).toISOString().split('T')[0]}
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.officialBeginDate).toISOString().split('T')[0]}
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.officialFinishDate).toISOString().split('T')[0]}
                                            </TableCell>



                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/projects/${row.projectId}/contracts/${row.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View</span>
                                                    </Button>

                                                    <Dialog
                                                        open={openDialogId === row.id}
                                                        onOpenChange={(isOpen) => setOpenDialogId(isOpen ? row.id : null)}
                                                    >

                                                        <DialogTrigger>
                                                            <Button variant="ghost" size="icon"
                                                                >
                                                                  <span className="flex items-center">
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="sr-only">Контракт</span>
                                                                  </span>
                                                            </Button>
                                                        </DialogTrigger>

                                                        <DialogContent className="bg-white text-black max-w-[60rem]">

                                                        <DialogHeader>
                                                                <DialogTitle>Контракты</DialogTitle>
                                                                <DialogDescription>
                                                                    Обработчик для работы с Контрактами
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div>
                                                                <ContractForm project={project}
                                                                              response={updateResponse?.response}
                                                                              onCancel={() => setOpenDialogId(null)}
                                                                              status={updateResponse?.status}
                                                                              onUpdate={update}
                                                                              data={row}/>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>


                                                    <Dialog
                                                        open={openDeleteDialogId === row.id}
                                                        onOpenChange={(isOpen) => setOpenDeleteDialogId(isOpen ? row.id : null)}
                                                    >

                                                        <DialogTrigger>
                                                            <Button variant="ghost" size="icon"
                                                            >
                                                          <span className="flex items-center">
                                                            <Trash className="h-4 w-4" />
                                                            <span className="sr-only">Удалить</span>
                                                          </span>
                                                            </Button>
                                                        </DialogTrigger>

                                                        <DialogContent className="bg-white text-black">

                                                            <DialogHeader>
                                                                <DialogTitle>Заявители</DialogTitle>
                                                                <DialogDescription>
                                                                    {`Вы уверены, что хотите удалить Заявителя ${row.name}?`}
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            <div className={'justify-end flex gap-5 mt-3'}>
                                                                <Button  type="button" variant="secondary" onClick={()=>setOpenDeleteDialogId(null)}>
                                                                    Отмена
                                                                </Button>

                                                                <Button
                                                                onClick={()=>deleteObj(row.id)}
                                                                >
                                                                    Удалить
                                                                </Button>
                                                            </div>

                                                        </DialogContent>
                                                    </Dialog>

                                                </div>
                                            </TableCell>

                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                        </Table>
                    </div>
                    :<div>Unable to load data</div>}

                {totalPages > 1 && (
                    <div className="py-4 border-t">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    {searchParams.page === 1 ? (
                                        <PaginationPrevious
                                            aria-disabled="true"
                                            className="pointer-events-none opacity-50"
                                            tabIndex={-1}
                                        />
                                    ) : (
                                        <PaginationPrevious
                                            onClick={() =>  setSearchParams({...searchParams, page:Math.max(1, searchParams.page - 1)})}
                                        />
                                    )}
                                </PaginationItem>

                                {getPageLinks()}

                                <PaginationItem>
                                    {searchParams.page === totalPages ? (
                                        <PaginationNext
                                            aria-disabled="true"
                                            className="pointer-events-none opacity-50"
                                            tabIndex={-1}
                                        />
                                    ) : (
                                        <PaginationNext
                                            onClick={() =>setSearchParams({...searchParams, page:Math.max(1, searchParams.page + 1)})}
                                        />
                                    )}
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
