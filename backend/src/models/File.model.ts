export type GetFileType = {
    contractId:number
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type AddFileType = {
    contractId:number
    files: Express.Multer.File[]
}

export type DeleteFileType = {
    id:number
}

export type UpdateFileType = {
    id:number,
    name:string,
}
