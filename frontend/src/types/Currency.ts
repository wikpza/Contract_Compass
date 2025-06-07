import {DeleteUnitType} from "@/types/Unit.ts";

export type GetCurrencyType = {
    id:number,
    name:string,
    symbol:string,
    code:string,
    createdAt:Date,
    updatedAt:Date
}


export type CreateCurrencyType = {
    name:string,
    symbol:string,
    code:string,
}

export type DeleteCurrencyType = {id:number}
export type UpdateCurrencyType = CreateCurrencyType & DeleteCurrencyType

