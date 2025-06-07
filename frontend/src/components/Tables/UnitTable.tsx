
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
import { Link } from 'react-router-dom';
import {Eye, Edit, Trash, Plus, ArrowUp, ArrowDown, Search, PlusCircle} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {GetUnitType} from "@/types/Unit.ts";

import {SearchParams} from "@/types";
import {useDeleteUnit, useUpdateUnit} from "@/api/Unit.api.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader, DialogOverlay,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import UnitForm from "@/components/Forms/UnitForm.tsx";
import SearchPanel from "@/components/SearchPanel.tsx";
import {isFormErrors} from "@/lib/errors";
import {toast} from "sonner";

type Props = {
    searchParams:SearchParams,
    setSearchParams: (input:SearchParams)=>void
    data:{count:number, rows:GetUnitType[]} | undefined,
    refetch: ()=>void,
}

export function UnitTable({data, refetch, searchParams, setSearchParams}:Props) {

    const totalPages = Math.ceil(data?.count / searchParams.limit);
    const columns = [{value:"name", name:"Название"}, {value:"symbol", name:"Символ"}, {value:"createdAt", name:"Дата создания"}]
    const {update, isSuccess:isUpdateSuccess, response:updateResponse} = useUpdateUnit()
    const {deleteObj, data:deleteResponse, isSuccess:isDeleteSuccess} = useDeleteUnit()
    const [openDialogId, setOpenDialogId] = useState<number | null>(null);
    const [openDeleteDialogId, setOpenDeleteDialogId] = useState<number | null>(null);
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

        if (isDeleteSuccess && deleteResponse && deleteResponse?.status === 201) {
            refetch();
            setOpenDeleteDialogId(null);
        }
    }, [isUpdateSuccess, isDeleteSuccess]);

    useEffect(() => {

        if (deleteResponse && isFormErrors(deleteResponse) && deleteResponse.status && deleteResponse.status >= 400 && deleteResponse.status < 500) {
            const errorFields = Object.keys(deleteResponse.details)
            errorFields.forEach(field => {
                toast.error(deleteResponse.details[field].join(", "));
            });

            if (errorFields.length === 0) {
                toast.error(deleteResponse.message);
            }

        }
    }, [ deleteResponse]);

    return (
        <div className="w-full">

            <SearchPanel searchParams={searchParams} setSearchParams={setSearchParams} columns={columns}/>
            {data?<ScrollArea className="w-full overflow-auto">
                <div className="min-w-max">
                    <Table>
                        <TableHeader>
                            <TableRow>

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
                                        // colSpan={hideActions ? columns.length : columns.length + 1}
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
                                            {row.name}
                                        </TableCell>

                                        <TableCell >
                                            {row.symbol}
                                        </TableCell>

                                        <TableCell >
                                            {row.createdAt.toString()}
                                        </TableCell>



                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">

                                                <Dialog
                                                    open={openDialogId === row.id}
                                                    onOpenChange={(isOpen) => setOpenDialogId(isOpen ? row.id : null)}
                                                >

                                                    <DialogTrigger>
                                                        <Button variant="ghost" size="icon"
                                                                // onClick={() => onEdit(row)}
                                                            >
                                                              <span className="flex items-center">
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Изменить</span>
                                                              </span>
                                                        </Button>
                                                    </DialogTrigger>

                                                    <DialogContent className="bg-white text-black">

                                                    <DialogHeader>
                                                            <DialogTitle>Единицы измерения</DialogTitle>
                                                            <DialogDescription>
                                                                Обработчик для работы с единицами измерениями
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div>
                                                            <UnitForm response={updateResponse?.response} onCancel={() => setOpenDialogId(null)}  status={updateResponse?.status} onUpdate={update} unit={row}/>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>





                                                <Dialog
                                                    open={openDeleteDialogId === row.id}
                                                    onOpenChange={(isOpen) => setOpenDeleteDialogId(isOpen ? row.id : null)}
                                                >

                                                    <DialogTrigger>
                                                        <Button variant="ghost" size="icon"
                                                            // onClick={() => onDelete(row)}
                                                        >
                                                      <span className="flex items-center">
                                                        <Trash className="h-4 w-4" />
                                                        <span className="sr-only">Удалить</span>
                                                      </span>
                                                        </Button>
                                                    </DialogTrigger>

                                                    <DialogContent className="bg-white text-black">

                                                        <DialogHeader>
                                                            <DialogTitle>Единицы измерения</DialogTitle>
                                                            <DialogDescription>
                                                                {`Вы уверены, что хотите удалить Единицу измерения ${row.name}?`}
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className={'justify-end flex gap-5 mt-3'}>
                                                            <Button  type="button" variant="secondary" onClick={()=>setOpenDeleteDialogId(null)}>
                                                                Отмена
                                                            </Button>

                                                            <Button
                                                            onClick={()=>deleteObj(row.id)}>
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
            </ScrollArea>
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
        </div>
    );
}
