export type GetApplicantType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreateApplicantType = {
    name:string,
    note?:string,
    email?:string,
    phone?:string,
    address?:string,
}

export type DeleteApplicantType = {
    id:number
}

export type UpdateApplicantType = CreateApplicantType & DeleteApplicantType