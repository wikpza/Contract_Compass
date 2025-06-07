import {AddFileType, DeleteFileType, GetFileType, UpdateFileType} from "../models/File.model";
import {FileVolume} from "../database/models";
import {Stream} from "node:stream";
import {BucketItemStat} from "minio";


export interface FileRepositoryInterface{
    addFile(input:AddFileType):Promise<any>
    deleteFile(input:DeleteFileType):Promise<FileVolume>
    updateFile(input:UpdateFileType):Promise<FileVolume>
    getFiles(input:GetFileType):Promise<{count:number, rows:FileVolume[]}>
    getFile(input:{id:number}):Promise<{file:Stream.Readable, stat: BucketItemStat}>
}