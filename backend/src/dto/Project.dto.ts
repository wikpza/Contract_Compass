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

export class CreateProjectRequest {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(100, { message: 'Name must be shorter than or equal to 100 characters' })
    name!: string;

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    currencyId!:number

    @Type(() => Date)
    @IsDate()
    startDate!: Date;

    @Type(() => Date)
    @IsDate()
    finishDate!: Date;


    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    note?: string;
}

export class UpdateProjectRequest extends CreateProjectRequest {}
