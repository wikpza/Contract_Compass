import {DeleteUnitType} from "@/types/Unit.ts";

export type GetPurchaserType = {
    id:number,
    name:string,
    email?:string,
    phone?:string,
    address?:string,
    note?:string,
    createdAt:Date,
    updatedAt:Date
}


export type CreatePurchaserType = {
    name:string,
    email?:string,
    phone?:string,
    address?:string,
    note?:string,
}

export type DeletePurchaserType = DeleteUnitType
export type UpdatePurchaserType = CreatePurchaserType & DeletePurchaserType

