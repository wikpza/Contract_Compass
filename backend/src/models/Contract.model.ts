export type GetContractType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
    type?:string
    projectId?:number
}

export type DeleteContractType = {
    id:number
}
type BaseContractType =   {
    name:string,
    type:string;
    projectId:number,
    applicantId:number,
    purchaserId:number,
    companyId:number,

    amount:number,
    currencyId:number,
    signDate:string,
    officialBeginDate:string,
    officialFinishDate:string,


    // giveAmount?:number,
    // transferCurrencyId?:number,
    // transferCurrencyExchangeRate?:number,
    projectCurrencyExchangeRate?:number,
    note?:string
}


export type CreateContractType = BaseContractType
export type UpdateContractType = BaseContractType & DeleteContractType