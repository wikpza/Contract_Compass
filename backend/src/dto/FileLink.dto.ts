import {IsNotEmpty, IsString, IsOptional, MaxLength, IsEmail, IsInt, Min} from "class-validator";

export class CreateFileLinkRequest {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(100, { message: 'Name must be shorter than or equal to 100 characters' })
    name!: string;

    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    url?: string;

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    contractId!:number
}

export class UpdateFileLinkRequest extends CreateFileLinkRequest {}