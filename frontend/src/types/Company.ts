import {DeleteUnitType} from "@/types/Unit.ts";

export type GetCompanyType = {
    id:number,
    name:string,
    email?:string,
    phone?:string,
    address?:string,
    note?:string,
    createdAt:Date,
    updatedAt:Date
}


export type CreateCompanyType = {
    name:string,
    email?:string,
    phone?:string,
    address?:string,
    note?:string,
}

export type DeleteCompanyType = DeleteUnitType
export type UpdateCompanyType = CreateCompanyType & DeleteCompanyType

