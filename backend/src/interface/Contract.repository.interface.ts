import {CreateContractType, DeleteContractType, GetContractType, UpdateContractType} from "../models/Contract.model";
import {Contract, Unit} from "../database/models";

export interface ContractRepositoryInterface {
    getContract(input:GetContractType):Promise<{ rows: Contract[]; count: number; }>
    createContract(input:CreateContractType):Promise<Contract>
    deleteContract(input:DeleteContractType):Promise<Contract>
    updateContract(input:UpdateContractType):Promise<Contract>
    getContractDetail(input:{id:number}):Promise<Contract>
    changeStatus(input:{id:number, status:string}):Promise<Contract>
}