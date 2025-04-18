export type GetCompanyType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreateCompanyType = {
    name:string,
    note?:string,
    email?:string,
    phone?:string,
    address?:string,
}

export type DeleteCompanyType = {
    id:number
}

export type UpdateCompanyType = CreateCompanyType & DeleteCompanyType