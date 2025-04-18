import {CreateCompanyType, DeleteCompanyType, GetCompanyType, UpdateCompanyType} from "../models/Company.model";
import {Company, Purchaser} from "../database/models";


export interface CompanyRepositoryInterface {
    getCompany(input:GetCompanyType):Promise<{ rows: Company[]; count: number; }>
    createCompany(input:CreateCompanyType):Promise<Company>
    deleteCompany(input:DeleteCompanyType):Promise<Company>
    updateCompany(input:UpdateCompanyType):Promise<Company>
}