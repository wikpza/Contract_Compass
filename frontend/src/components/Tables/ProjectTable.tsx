
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
import {useDeleteApplicant, useUpdateApplicant} from "@/api/Applicant.api.ts";
import {GetProjectType} from "@/types/Project.ts";
import {Badge} from "@/components/ui/badge.tsx";
import ProjectForm from "@/components/Forms/ProjectForm.tsx";
import {useDeleteProject, useUpdateProject} from "@/api/Project.api.ts";
import {useNavigate} from "react-router-dom";
import NoteDialog from "@/components/NoteDialog.tsx";
import {isFormErrors} from "@/lib/errors";
import {toast} from "sonner";

type Props = {
    searchParams:SearchParams,
    setSearchParams: (input:SearchParams)=>void
    data:{count:number, rows:GetProjectType[]} | undefined,
    refetch: ()=>void,
}

export function ProjectTable({data, refetch, searchParams, setSearchParams}:Props) {

    const totalPages = Math.ceil(data?.count / searchParams.limit);
    const columnShow = [
        {value:"name", name:"Название"},
        {value:"note", name:"Заметка"},
        {value:"status", name:"Статус"},
        {value:"currencyId", name:"Валюта"},
        {value:"startDate", name:"Дата начала"},
        {value:"finishDate", name:"Дата завершения"},
        {value:"createdAt", name:"Дата создания"}
    ]
    const columns = [
        {value:"name", name:"Название"},
        {value:"note", name:"Заметка"},
        {value:"status", name:"Статус"},
        {value:"startDate", name:"Дата начала"},
        {value:"finishDate", name:"Дата завершения"},
        {value:"createdAt", name:"Дата создания"}
    ]

    const {update, isSuccess:isUpdateSuccess, response:updateResponse} = useUpdateProject()
    const {deleteObj, data:deleteResponse, isSuccess:isDeleteSuccess} = useDeleteProject()
    const navigate = useNavigate()

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

                                    {columnShow.map(column=>(
                                        <TableHead
                                            key={column.value}
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

                                            <NoteDialog note={row.note}/>

                                            <TableCell >
                                                <Badge className={row.status? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} variant="outline">
                                                    {row.status?"Активен":"Завершен"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell >
                                                {row.currency.code }
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.startDate).toISOString().split('T')[0]}
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.finishDate).toISOString().split('T')[0]}
                                            </TableCell>

                                            <TableCell >
                                                {new Date(row.createdAt).toISOString().split('T')[0]}
                                            </TableCell>



                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">


                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/projects/${row.id}`)}
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
                                                                <ProjectForm response={updateResponse?.response} onCancel={() => setOpenDialogId(null)}  status={updateResponse?.status} onUpdate={update} data={row}/>
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
