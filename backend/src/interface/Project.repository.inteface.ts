import {
    CreateProjectType,
    DeleteProjectType,
    GetProjectDetailType,
    GetProjectType, UpdateProjectStatusType,
    UpdateProjectType
} from "../models/Project.model";
import {Project, Unit} from "../database/models";


export interface ProjectRepositoryInterface {
    getProject(input:GetProjectType):Promise<{ rows: Project[]; count: number; }>
    getProjectDetail(input:{id:number}):Promise<GetProjectDetailType>
    createProject(input:CreateProjectType):Promise<Project>
    deleteProject(input:DeleteProjectType):Promise<Project>
    updateProject(input:UpdateProjectType):Promise<Project>
    updateProjectStatus(input:UpdateProjectStatusType):Promise<Project>
}

