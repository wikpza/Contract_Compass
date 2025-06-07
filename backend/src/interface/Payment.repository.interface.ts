import {ContractPaymentHistory} from "../database/models";
import {CancelPaymentType, CreatePaymentType, GetPaymentType} from "../models/Payment.model";


export interface PaymentRepositoryInterface {
    getPayment(input:GetPaymentType):Promise<{ rows: ContractPaymentHistory[]; count: number; }>
    createPayment(input:CreatePaymentType):Promise<ContractPaymentHistory>
    cancelPayment(input:CancelPaymentType):Promise<ContractPaymentHistory>
    finishPayment(input:{contractId:number, giveDate:Date, note?:string}):Promise<ContractPaymentHistory>
}