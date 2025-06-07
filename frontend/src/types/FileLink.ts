export type GetFileLinkType = {
    id: number;
     name:string;
     url:string
     contractId:number,
    createdAt:Date,
    updatedAt:Date
}


export type CreateFileLinkType = {
    name:string,
    url:string,
    contractId:number,
}

export type DeleteFileLinkType = {id:number}


export type UpdateFileLinkType = {
    id:number
    name:string
    url:string
}