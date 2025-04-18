import React from 'react';
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {SearchParams} from "@/types";

type Props = {
    searchParams:SearchParams,
    setSearchParams:(value:SearchParams)=>void,
    columns:{name:string,value:string,}[]
}
const SearchPanel = ({searchParams, setSearchParams, columns}:Props) => {
    return (
        <div className="p-4 bg-muted/30 rounded-t-md border-b">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 flex-grow">
                    <Search className="h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Search..."
                        className="max-w-sm"
                        value={searchParams.searchValue}
                        onChange={(e) => setSearchParams({...searchParams, searchValue: e.target.value, page: 1})}


                    />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <Select
                        value={searchParams.searchBy || 'name'}
                        onValueChange={(value) => setSearchParams({...searchParams, searchBy: value, page: 1})}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Search by"/>
                        </SelectTrigger>
                        <SelectContent>
                            {columns.map((column) => (
                                <SelectItem
                                    key={column.value}
                                    value={column.value}>
                                    {`Search by: ${column.name}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={searchParams.sortBy || 'createdAt'}
                        onValueChange={(value) => setSearchParams({
                            ...searchParams,
                            sortBy: value || "createdAt",
                            page: 1
                        })}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by"/>
                        </SelectTrigger>
                        <SelectContent>
                            {columns.map((column) => (
                                <SelectItem key={column.value} value={column.value}>
                                    {`Sort by: ${column.name}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={searchParams.sortType}
                        onValueChange={(value) => setSearchParams({
                            ...searchParams,
                            sortType: value as 'ASC' | 'DESC',
                            page: 1
                        })}
                        // disabled={!searchParams.sortType}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue>
                                {searchParams.sortType === 'ASC' ? 'Возрастанию' : 'Убыванию'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ASC">Возрастанию</SelectItem>
                            <SelectItem value="DESC">Убыванию</SelectItem>
                        </SelectContent>
                    </Select>

                </div>
            </div>
        </div>
    );
};

export default SearchPanel;