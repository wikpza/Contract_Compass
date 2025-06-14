
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
import UnitForm from "@/components/Forms/UnitForm.tsx";
import {GetApplicantType} from "@/types/Applicant.ts";
import SearchPanel from "@/components/SearchPanel.tsx";
import {useDeleteApplicant, useUpdateApplicant} from "@/api/Applicant.api.ts";
import ApplicantForm from "@/components/Forms/ApplicantForm.tsx";
import {GetFileVolumeType} from "@/types/File.ts";
import {useNavigate} from "react-router-dom";
import {useDeleteFileVolume, useUpdateFileVolume} from "@/api/FileVolume.api.ts";
import FileVolumeForm from "@/components/Forms/FileVolumeForm.tsx";

type Props = {
    searchParams:SearchParams,
    setSearchParams: (input:SearchParams)=>void
    data:{count:number, rows:GetFileVolumeType[]} | undefined,
    refetch: ()=>void,
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export function FileVolumeTable({data, refetch, searchParams, setSearchParams}:Props) {

    const totalPages = Math.ceil(data?.count / searchParams.limit);
    const columns = [
        {value:"name", name:"Название"},
        {value:"createdAt", name:"Дата создания"}
    ]
    const {update, isSuccess:isUpdateSuccess, response:updateResponse} = useUpdateFileVolume()

    const {deleteObj, data:deleteResponse, isSuccess:isDeleteSuccess} = useDeleteFileVolume()

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
    }, [isDeleteSuccess, isUpdateSuccess]);

    const redirectToExternalSite = (id) => {
        window.location.href = `${API_BASE_URL}/file/${id}`;
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
                                                {row.createdAt.toString()}
                                            </TableCell>



                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => redirectToExternalSite(row.id)}
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
                                                                    <span className="sr-only">Изменить</span>
                                                                  </span>
                                                            </Button>
                                                        </DialogTrigger>

                                                        <DialogContent className="bg-white text-black">

                                                        <DialogHeader>
                                                                <DialogTitle>Заявители</DialogTitle>
                                                                <DialogDescription>
                                                                    Обработчик для работы с Заявителями
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div>
                                                                <FileVolumeForm
                                                                    response={updateResponse?.response}
                                                                    onCancel={() => setOpenDialogId(null)}
                                                                    status={updateResponse?.status}
                                                                    onUpdate={update} data={row}/>
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
                                                                <DialogTitle>Документ</DialogTitle>
                                                                <DialogDescription>
                                                                    {`Вы уверены, что хотите удалить Документ ${row.name}?`}
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
