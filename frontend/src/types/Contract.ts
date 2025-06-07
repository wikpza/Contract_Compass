import {DeleteUnitType} from "@/types/Unit.ts";




export type GetContractType = {
    id:number,
    name:string,
    type:string,

    projectId:number,
    applicantId:number,
    purchaserId:number,
    companyId:number,

    project:{id:number,name:string, note?:string},
    applicant:{id:number, name:string, email?:string, phone?:string},
    purchaser:{id:number, name:string, email?:string, phone?:string},
    company:{id:number, name:string, email?:string, phone?:string},
    currency:{id:number, name:string, code:string, symbol:string,}
    currencyId:number,
    amount:number,
    signDate:string,
    officialBeginDate:string,
    officialFinishDate:string,
    status:string,

    finishDate?:string,
    // transferCurrencyId:number,
    // transferCurrencyExchangeRate:number,
    projectCurrencyExchangeRate:number,

    giveAmount?:number;
    fileLink?:string;
    file?:string;

    note?:string,
    createdAt:Date,
    updatedAt:Date
}



export type CreateContractType = {
    name:string,
    type:string,
    projectId:number,
    applicantId:number,
    purchaserId:number,
    companyId:number,
    currencyId:number,
    amount:number,
    signDate:Date,
    officialBeginDate:Date,
    officialFinishDate:Date,
    projectCurrencyExchangeRate?:number,
    note?:string,
}

export type DeleteContractType = DeleteUnitType
export type UpdateContractType = CreateContractType & DeleteContractType

