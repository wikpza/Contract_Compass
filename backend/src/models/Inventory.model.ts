
export type GetProductContractType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string,
    contractId:number
}

export type GetInventoryHistoryType = GetProductContractType

export type AddProductContractType = {
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
    giveDate:Date,
    quantity:number
}

export type UpdateProductContractType = {
    id:number,
    note?:string,
    contractQuantity:number,
}

export type DeleteProductContractType = {
    id:number
}