import {DeleteUnitType} from "@/types/Unit.ts";

export type GetApplicantType = {
    id:number,
    name:string,
    email?:string,
    phone?:string,
    address?:string,
    note?:string,
    createdAt:Date,
    updatedAt:Date
}


export type CreateApplicantType = {
    name:string,
    email?:string,
    phone?:string,
    address?:string,
    note?:string,
}

export type DeleteApplicantType = DeleteUnitType
export type UpdateApplicantType = CreateApplicantType & DeleteApplicantType

