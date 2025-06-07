import {DeleteUnitType} from "@/types/Unit.ts";


export type GetProjectType = {
    id:number,
    name:string,
    status:boolean,
    note?:string,
    startDate:Date,
    finishDate:Date,
    currencyId:number,
    currency:{id:number, name:string, code:string, symbol:string}
    createdAt:string,
    updatedAt:string
}


export type GetProjectDetailType = {
    project:GetProjectType

    productCount:number,
    serviceCount:number,

    activeCount: number,
    completedCount:number,
    canceledCount:number,

    totalProductCount:number,
    deliveredProductCount:number,

    totalAmount:number,
    totalSpent:number
}

export type CreateProjectType = {
    name:string,
    note?:string,
    startDate:Date,
    finishDate:Date,
    currencyId:number,
}

export type DeleteProjectType = DeleteUnitType
export type UpdateProjectType = CreateProjectType & DeleteProjectType
