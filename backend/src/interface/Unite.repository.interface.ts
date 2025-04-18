import {CreateUnitType, DeleteUnitType, GetUnitType, UpdateUnitType} from "../models/unit.model";
import {Unit} from "../database/models";

export interface UnitRepositoryInterface {
    getUnit(input:GetUnitType):Promise<{ rows: Unit[]; count: number; }>
    createUnit(input:CreateUnitType):Promise<Unit>
    deleteUnit(input:DeleteUnitType):Promise<Unit>
    updateUnit(input:UpdateUnitType):Promise<Unit>
}