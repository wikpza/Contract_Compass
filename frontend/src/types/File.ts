export type GetFileVolumeType = {
    id: number;
     name:string;
     key:string
     contractId:number,
    createdAt:Date,
    updatedAt:Date
}


// export type CreateFileVolumeType = {
//     name:string,
//     symbol:string,
//     code:string,
// }
//
// export type DeleteFileVolumeType = {id:number}
// export type UpdateFileVolumeType = CreateFileVolumeType & DeleteFileVolumeType
//

export type UpdateFileVolumeType = {
    id:number
    name:string
}