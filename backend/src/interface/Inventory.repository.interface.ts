import {ContractPaymentHistory, ProductInventory, ProductInventoryHistory} from "../database/models";
import {CancelPaymentType, CreatePaymentType, GetPaymentType} from "../models/Payment.model";
import {
    AddInventorySessionType,
    AddProductContractType, DeleteProductContractType,
    GetInventoryHistoryType,
    GetProductContractType, UpdateProductContractType
} from "../models/Inventory.model";


export interface InventoryRepositoryInterface {
    getInventory(input:GetProductContractType):Promise<{
        rows: ProductInventory[];
        count: number;
        totalCount:number,
        lastCount:number
    }>
    getInventoryHistory(input:GetInventoryHistoryType):Promise<{ rows: ProductInventoryHistory[]; count: number; }>

    updateInventory(input:UpdateProductContractType):Promise<ProductInventory>
    deleteInventory(input:DeleteProductContractType):Promise<ProductInventory>

    addProductContract(input:AddProductContractType):Promise<ProductInventory>
    addInventoryProduct(input:AddInventorySessionType):Promise<ProductInventoryHistory>
}