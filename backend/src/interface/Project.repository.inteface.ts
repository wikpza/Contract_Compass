import {CreateProjectType, DeleteProjectType, GetProjectType, UpdateProjectType} from "../models/Project.model";
import {Project} from "../database/models";


export interface ProjectRepositoryInterface {
    getProject(input:GetProjectType):Promise<Project[]>
    createProject(input:CreateProjectType):Promise<Project>
    deleteProject(input:DeleteProjectType):Promise<Project>
    updateProject(input:UpdateProjectType):Promise<Project>
}

