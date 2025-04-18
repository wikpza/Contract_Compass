import { IsNotEmpty, IsString, IsOptional, MaxLength, IsEmail } from "class-validator";

export class CreateCompanyRequest {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(100, { message: 'Name must be shorter than or equal to 100 characters' })
    name!: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @MaxLength(255, { message: 'Email must be shorter than or equal to 255 characters' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Phone must be a string' })
    @MaxLength(20, { message: 'Phone must be shorter than or equal to 20 characters' })
    phone?: string;

    @IsOptional()
    @IsString({ message: 'Address must be a string' })
    @MaxLength(500, { message: 'Address must be shorter than or equal to 500 characters' })
    address?: string;

    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    note?: string;
}

export class UpdateCompanyRequest extends CreateCompanyRequest {}