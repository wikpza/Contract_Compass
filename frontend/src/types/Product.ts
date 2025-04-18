import {DeleteUnitType} from "@/types/Unit.ts";

export type GetProductType = {
    id:number,
    name:string,
    unitId:number,
    note?:string,
    createdAt:Date,
    updatedAt:Date,
    unit:{id:number, name:string, symbol:string}
}


export type CreateProductType = {
    name:string,
    unitId:number,
    note?:string,
}

export type DeleteProductType = DeleteUnitType
export type UpdateProductType = CreateProductType & DeleteProductType

