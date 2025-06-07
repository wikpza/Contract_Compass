import {GetProductType} from "@/types/Product.ts";
import {GetContractType} from "@/types/Contract.ts";


export type GetProductInventoryType = {
    id:number,
    productId:number,
    contractId:number,
    note?:string,
    contractQuantity:number,
    takeQuantity:number,

    product:GetProductType,
    contract:GetContractType,
    createdAt:string

    type:string
}

export type GetProductInventoryHistoryType = {
    id:number,
    productInventoryId:number,
    quantity:number,
    type:string,
    giveDate:string,
    note?:string,
    product_inventory:GetProductInventoryType
}


export type AddProductInventoryType = {
    productId:number,
    contractId:number,
    note?:string,
    contractQuantity:number,
}

export type AddInventorySessionType = {
    id:number,
    type:string,
    amount:number,
    note?:string,
    giveDate:Date
}

export type UpdateProductContractType = {
    id:number,
    note?:string,
    contractQuantity:number,
}

export type DeleteProductContractType = {
    id:number
}