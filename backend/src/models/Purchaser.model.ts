export type GetPurchaserType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreatePurchaserType = {
    name:string,
    note?:string,
    email?:string,
    phone?:string,
    address?:string,
}

export type DeletePurchaserType = {
    id:number
}

export type UpdatePurchaserType = CreatePurchaserType & DeletePurchaserType