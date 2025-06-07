
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
import { Edit, Trash, ArrowUp, ArrowDown} from 'lucide-react';
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
import UnitForm from "@/components/Forms/UnitForm.tsx";
import {GetApplicantType} from "@/types/Applicant.ts";
import SearchPanel from "@/components/SearchPanel.tsx";
import {useDeleteApplicant, useUpdateApplicant} from "@/api/Applicant.api.ts";
import ApplicantForm from "@/components/Forms/ApplicantForm.tsx";
import {GetProductInventoryHistoryType} from "@/types/Inventory.ts";
import {useGetProductInventoryHistory} from "@/api/Inventory.api.ts";
import NoteDialog from "@/components/NoteDialog.tsx";

type Props = {
    id:number
}

export function DeliveryProductHistoryTable({id}:Props) {

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
    const {data} = useGetProductInventoryHistory({...searchParams, id})
    if(!data) return <div>Не удалось загрузить данные</div>

    const totalPages = Math.ceil(data?.data.count / searchParams.limit);
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

                {data?
                    <div
                        className="min-w-[300px]"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>

                                    <TableHead>ID</TableHead>

                                    <TableHead>Название продукта</TableHead>

                                    <TableHead>Количество</TableHead>

                                    <TableHead>Тип</TableHead>

                                    <TableHead>Заметка</TableHead>

                                    <TableHead>Дата</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data.rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            className="h-24 text-center"
                                        >
                                            {data?.data.rows.length === 0
                                                ? (searchParams.searchValue ? "No matching results found" : "No results found")
                                                : "No data for this page"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data.rows.map((row, rowIndex) => (
                                        <TableRow key={row.id || rowIndex}>

                                            <TableCell >
                                                {row.id}
                                            </TableCell>

                                            <TableCell >
                                                {`${row.product_inventory.product.name}`}
                                            </TableCell>

                                            <TableCell >
                                                {`${row.quantity}  ${row.product_inventory.product.unit.symbol}`}
                                            </TableCell>

                                            <TableCell className={'text-center'}>
                                                {`${row.type === 'issued'? "Получение" :"Возврат"}`}
                                            </TableCell>

                                            <NoteDialog note={row.note}/>

                                            <TableCell >
                                                {row.giveDate.toString()}
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
