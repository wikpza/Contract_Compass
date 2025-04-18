export type GetAccessLinkType = {
    searchBy:string,
    searchValue:string,
    page:number,
    limit:number,
    sortBy:string,
    searchType:string
}

export type CreateAccessLinkType = {
    linkCode:string,
    projectId:number,
    status:string,
}

export type DeleteAccessLinkType = {
    id:number
}

export type UpdateAccessLinkType = CreateAccessLinkType & DeleteAccessLinkType