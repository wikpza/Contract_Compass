export type GetProjectType = {
    searchBy:string,
    searchValue:string,
    page:number,
    limit:number,
    sortBy:string,
    searchType:string
}

export type CreateProjectType = {
    name:string,
    note:string,
    startDate:Date,
    finishDate:Date,
    currencyId:number
}

export type DeleteProjectType = {
    id:number,
    status:boolean
}

export type UpdateProjectType = CreateProjectType & DeleteProjectType