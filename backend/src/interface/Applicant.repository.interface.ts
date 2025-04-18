import {Applicant, Unit} from "../database/models";
import {
    CreateApplicantType,
    DeleteApplicantType,
    GetApplicantType,
    UpdateApplicantType
} from "../models/Applicant.model";

export interface ApplicantRepositoryInterface {
    getApplicant(input:GetApplicantType):Promise<{ rows: Applicant[]; count: number; }>
    createApplicant(input:CreateApplicantType):Promise<Applicant>
    deleteApplicant(input:DeleteApplicantType):Promise<Applicant>
    updateApplicant(input:UpdateApplicantType):Promise<Applicant>
}