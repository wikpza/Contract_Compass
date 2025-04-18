
import React, { useState } from 'react';
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
import { Eye, Edit, Trash, Plus, ArrowUp, ArrowDown, Search } from 'lucide-react';
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

export function DataTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState<string | null>(null);

  // Get searchable columns
  const searchableColumns = columns.filter(col => col.searchable !== false);
  
  // Default to first searchable column if none selected
  const effectiveSearchColumn = searchColumn || (searchableColumns.length > 0 ? searchableColumns[0].accessor : null);


  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  
  // Handle sort toggle
  const toggleSort = (columnAccessor: string) => {
    if (sortColumn === columnAccessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnAccessor);
      setSortDirection('asc');
    }
  };

  // Generate page links
  const getPageLinks = () => {
    let pages = [];
    
    // Always show first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => setCurrentPage(1)} 
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show current page and adjacent pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setCurrentPage(i)} 
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
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
            onClick={() => setCurrentPage(totalPages)} 
            isActive={currentPage === totalPages}
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
      {addPath && (
        <div className="p-4 flex justify-end">
          <Button asChild>
            <Link to={addPath}>
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Link>
          </Button>
        </div>
      )}

      {/* Search and Sort Panel */}
      <div className="p-4 bg-muted/30 rounded-t-md border-b">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-grow">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="max-w-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <Select 
              value={effectiveSearchColumn || ''} 
              onValueChange={(value) => setSearchColumn(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                {searchableColumns.map((column) => (
                  <SelectItem key={column.accessor} value={column.accessor}>
                    {column.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={sortColumn || ''} 
              onValueChange={(value) => setSortColumn(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {columns.filter(col => col.sortable !== false).map((column) => (
                  <SelectItem key={column.accessor} value={column.accessor}>
                    {column.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={sortDirection} 
              onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}
              disabled={!sortColumn}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue>
                  {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ScrollArea className="w-full overflow-auto">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column.accessor}
                    className={column.sortable !== false ? "cursor-pointer" : ""}
                    onClick={column.sortable !== false ? () => toggleSort(column.accessor) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {sortColumn === column.accessor && (
                        sortDirection === 'asc' 
                          ? <ArrowUp className="h-3 w-3" /> 
                          : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                ))}
                {!hideActions && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={hideActions ? columns.length : columns.length + 1}
                    className="h-24 text-center"
                  >
                    {filteredData.length === 0 
                      ? (searchTerm ? "No matching results found" : "No results found") 
                      : "No data for this page"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow key={row.id || rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column.accessor}`}>
                        {column.render
                          ? column.render(row[column.accessor], row)
                          : row[column.accessor]}
                      </TableCell>
                    ))}
                    {!hideActions && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {viewPath && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <Link to={`${viewPath}/${row.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                          )}
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onView(row)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                          )}
                          {editPath && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <Link to={`${editPath}/${row.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(row)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(row)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="py-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {currentPage === 1 ? (
                  <PaginationPrevious
                    aria-disabled="true"
                    className="pointer-events-none opacity-50"
                    tabIndex={-1}
                  />
                ) : (
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  />
                )}
              </PaginationItem>
              
              {getPageLinks()}
              
              <PaginationItem>
                {currentPage === totalPages ? (
                  <PaginationNext
                    aria-disabled="true"
                    className="pointer-events-none opacity-50"
                    tabIndex={-1}
                  />
                ) : (
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
