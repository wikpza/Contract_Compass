export type GetFileLinkType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string,
    contractId?:number
}

export type CreateFileLinkType = {
    name:string,
    url:string,
    contractId:number
}

export type DeleteFileLinkType = {
    id:number
}

export type UpdateFileLinkType = CreateFileLinkType & DeleteFileLinkType