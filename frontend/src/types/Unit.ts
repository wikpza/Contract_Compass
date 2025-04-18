export type GetUnitType = {
    id:number,
    name:string,
    symbol:string,
    createdAt:Date,
    updatedAt:Date,
}

export type CreateUnitType = {
    name:string,
    symbol:string,
}

export type DeleteUnitType = {
    id:number
}

export type UpdateUnitType = CreateUnitType & DeleteUnitType