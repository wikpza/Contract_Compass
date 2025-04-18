import {CreateContractType, DeleteContractType, GetContractType, UpdateContractType} from "../models/Contract.model";
import {Contract} from "../database/models";

export interface ContractRepositoryInterface {
    getContract(input:GetContractType):Promise<Contract[]>
    createContract(input:CreateContractType):Promise<Contract>
    deleteContract(input:DeleteContractType):Promise<Contract>
    updateContract(input:UpdateContractType):Promise<Contract>
}