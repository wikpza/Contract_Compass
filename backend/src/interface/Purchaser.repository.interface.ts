import {Purchaser} from "../database/models";
import {
    CreatePurchaserType,
    DeletePurchaserType,
    GetPurchaserType,
    UpdatePurchaserType
} from "../models/Purchaser.model";

export interface PurchaserRepositoryInterface {
    getPurchaser(input:GetPurchaserType):Promise<{ rows: Purchaser[]; count: number; }>
    createPurchaser(input:CreatePurchaserType):Promise<Purchaser>
    deletePurchaser(input:DeletePurchaserType):Promise<Purchaser>
    updatePurchaser(input:UpdatePurchaserType):Promise<Purchaser>
}