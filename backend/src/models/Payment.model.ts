
export type GetPaymentType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreatePaymentType = {
    type:string,
    contractId:number,
    currencyId:number,
    amount:number,
    giveDate:Date,
    note?:string,
    contractCurrencyExchangeRate?:number
}

export type CancelPaymentType = {
    id:number
}

