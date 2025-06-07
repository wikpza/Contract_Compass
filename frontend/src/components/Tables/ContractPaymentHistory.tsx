
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
import { Edit, Trash, ArrowUp, ArrowDown, Cross, SquareX} from 'lucide-react';
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
import {GetPaymentType} from "@/types/Payment.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {useCancelPayment} from "@/api/Payment.api.ts";
import {GetContractType} from "@/types/Contract.ts";

type Props = {
    searchParams:SearchParams,
    setSearchParams: (input:SearchParams)=>void
    data:{count:number, rows:GetPaymentType[]} | undefined,
    refetch:()=>void,
    contract:GetContractType
}

export const ContractPaymentHistoryTable = ({data, searchParams, setSearchParams, refetch, contract}:Props) => {

    const totalPages = Math.ceil(data?.count / searchParams.limit);
    const columns = [
        {value:"type", name:"Статус"},
        {value:"amount", name:"Сумма"},
        {value:"currencyId", name:"Валюта"},
        {value:"contractCurrencyExchangeRate", name:`Курс валюты для ${contract.currency.code}`},
        {value:"note", name:"Заметки"},
        {value:"giveDate", name:"Дата Получения"},
        {value:"createdAt", name:"Дата создания"}
    ]

    const [openCancelDialogId, setOpenCancelDialogId] = useState<number | null>(null);
    const {isSuccess, response, update} = useCancelPayment()

    useEffect(() => {
        if (isSuccess && response && response?.status === 201) {
            refetch();
            setOpenCancelDialogId(null);
        }

    }, [isSuccess]);

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
                                    <TableHead>Действия</TableHead>

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
                                                <Badge className={row.type === 'issued'? "bg-green-100 text-green-800" : row.type ==='refund'?"bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"} variant="outline">
                                                    {row?.type === 'issued' && "Взнос"}
                                                    {row?.type === 'refund' && "Возврат"}
                                                    {row?.type === 'canceled' && "Отмена"}
                                                </Badge>
                                            </TableCell>



                                            <TableCell >
                                                {row.amount}
                                            </TableCell>

                                            <TableCell >
                                                {row.currency.code}
                                            </TableCell>

                                            <TableCell >
                                                {row.contractCurrencyExchangeRate || "-"}
                                            </TableCell>

                                            <TableCell >
                                                {row?.note || 'not note'}
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.giveDate).toISOString().split('T')[0]}
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.createdAt).toISOString().split('T')[0]}
                                            </TableCell>



                                            <TableCell >
                                                    <Dialog
                                                        open={openCancelDialogId === row.id}
                                                        onOpenChange={(isOpen) => setOpenCancelDialogId(isOpen ? row.id : null)}
                                                    >

                                                        <DialogTrigger disabled={row.type === 'canceled'}>
                                                            <Button  disabled={row.type === 'canceled'} >
                                                                  Отменить транзакцию
                                                            </Button>
                                                        </DialogTrigger>

                                                        <DialogContent className="bg-white text-black">

                                                            <DialogHeader>
                                                                <DialogTitle>Заявители</DialogTitle>
                                                                <DialogDescription>
                                                                    {`Вы уверены, что хотите отменить транзакцию?`}
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            <div className={'justify-end flex gap-5 mt-3'}>
                                                                <Button  type="button" variant="secondary" onClick={()=>setOpenCancelDialogId(null)}>
                                                                    Отмена
                                                                </Button>

                                                                <Button
                                                                onClick={()=>update({id:row.id})}>
                                                                    Удалить
                                                                </Button>
                                                            </div>

                                                        </DialogContent>
                                                    </Dialog>
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
