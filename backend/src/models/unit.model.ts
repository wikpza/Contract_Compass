export type GetUnitType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreateUnitType = {
    name:string,
    symbol:string,
}

export type DeleteUnitType = {
    id:number
}

export type UpdateUnitType = CreateUnitType & DeleteUnitType