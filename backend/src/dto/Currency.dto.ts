import {IsNotEmpty, IsString, IsUppercase, Length, MaxLength} from "class-validator";

export class CreateCurrencyRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60, {message:"name of unit must not be greater than 60 characters"})
    name!:string;

    @IsString()
    @IsNotEmpty()
    @Length(1, 1, {message:"symbol must not be only 1 character"})
    symbol!:string;

    @IsString()
    @IsNotEmpty()
    @IsUppercase()
    @Length(3, 3, {message:"symbol must not be only 3 characters"})
    code!:string;

}

export class UpdateCurrencyRequest extends CreateCurrencyRequest {}