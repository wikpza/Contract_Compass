import {DeleteUnitType} from "@/types/Unit.ts";

export type GetPaymentType = {
    id:number,
    type:string,
    contractId:number,
    currencyId:number,
    giveDate:Date,
    amount:number,
    currency:{id:number, name:string, symbol:string, code:string}
    contractCurrencyExchangeRate?:number
    createdAt:Date,
    updatedAt:Date,
    note?:string
}


export type CreatePaymentType = {
    type:string,
    contractId:number,
    currencyId:number,
    giveDate:Date,
    amount:number,
    contractCurrencyExchangeRate?:number,
    note?:string
}

export type CancelPaymentType = {
    id:number
}

export type FinishPaymentType ={
    giveDate:Date,
    note?:string,
    contractId:number
}

