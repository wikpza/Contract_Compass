export type GetProductType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreateProductType = {
    name:string,
    note?:string,
    unitId:number,
}

export type DeleteProductType = {
    id:number
}

export type UpdateProductType = CreateProductType & DeleteProductType