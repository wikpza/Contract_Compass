import {Applicant, FileLink, Unit} from "../database/models";
import {
    CreateApplicantType,
    DeleteApplicantType,
    GetApplicantType,
    UpdateApplicantType
} from "../models/Applicant.model";
import {CreateFileLinkType, DeleteFileLinkType, GetFileLinkType, UpdateFileLinkType} from "../models/FileLink.model";

export interface FileLinkRepositoryInterface {
    getFileLink(input:GetFileLinkType):Promise<{ rows: FileLink[]; count: number; }>
    createFileLink(input:CreateFileLinkType):Promise<FileLink>
    deleteFileLink(input:DeleteFileLinkType):Promise<FileLink>
    updateFileLink(input:UpdateFileLinkType):Promise<FileLink>
}