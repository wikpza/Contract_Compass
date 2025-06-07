import {CreateCurrencyType, DeleteCurrencyType, GetCurrencyType, UpdateCurrencyType} from "../models/Currency.model";
import {Currency, Unit} from "../database/models";

export interface CurrencyRepositoryInterface {
    getCurrency(input:GetCurrencyType):Promise<{ rows: Currency[]; count: number; }>
    createCurrency(input:CreateCurrencyType):Promise<Currency>
    deleteCurrency(input:DeleteCurrencyType):Promise<Currency>
    updateCurrency(input:UpdateCurrencyType):Promise<Currency>
}

