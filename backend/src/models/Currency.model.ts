export type GetCurrencyType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreateCurrencyType = {
    name:string,
    code:string,
    symbol:string,
}

export type DeleteCurrencyType = {
    id:number
}

export type UpdateCurrencyType = CreateCurrencyType & DeleteCurrencyType