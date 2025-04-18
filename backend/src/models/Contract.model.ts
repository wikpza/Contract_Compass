export type GetContractType = {
    searchBy:string,
    searchValue:string,
    page:number,
    limit:number,
    sortBy:string,
    searchType:string
}

export type CreateContractType = {
    type:string;
    name:string,
    projectId:number,
    applicantId:number,
    purchaserId:number,
    companyId:number,
    amount:number,
    currencyId:number,
    signDate:Date,
    officialBeginDate:Date,
    officialFinishDate:Date,


    giveAmount?:number,
    transferCurrencyId?:number,
    transferCurrencyExchangeRate?:number,
    projectCurrencyExchangeRate?:number,
    note?:string

    // finishDate:Date,
    // status:Date
}


export type DeleteContractType = {
    id:number
}

export type UpdateContractType = CreateContractType & DeleteContractType