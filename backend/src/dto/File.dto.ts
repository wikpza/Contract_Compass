import 'reflect-metadata'; // 👈 Должно быть ПЕРВЫМ импортом

import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsInt,
    Min,
    IsDate,
    MaxLength
} from "class-validator";
import {Type} from "class-transformer";

export class AddFileRequest {

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    contractId!:number
}

export class UpdateFileRequest {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(100, { message: 'Name must be shorter than or equal to 100 characters' })
    name!: string;
}