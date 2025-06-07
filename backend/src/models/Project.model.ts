import {Project} from "../database/models";

export type GetProjectType = {
    searchBy?:string | undefined,
    searchValue?:string | undefined,
    page?:number,
    limit?:number,
    sortBy?:string | undefined,
    sortType?:string
}

export type CreateProjectType = {
    name:string,
    note?:string,
    startDate:Date,
    finishDate:Date,
    currencyId:number
}

export type GetProjectDetailType = {
    project:Project

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
export type DeleteProjectType = {
    id:number,
}

export type UpdateProjectType = CreateProjectType & DeleteProjectType

export type UpdateProjectStatusType = DeleteProjectType