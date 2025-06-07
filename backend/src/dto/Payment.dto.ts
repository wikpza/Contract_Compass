import {IsDate, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min} from "class-validator";
import {Type} from "class-transformer";
import {IsPositiveNonZero} from "../utils";

export class CreatePaymentRequest {
    @IsNotEmpty({ message: 'Type is required' })
    @IsIn(['issued', 'refund'], {
        message: 'Type must be either "issued", "canceled" or "refund"'
    })
    type!: 'issued' | 'refund';


    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    currencyId!:number

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    contractId!:number

    @IsNumber()
    @Min(0, {message:"id must be greater or equal than 0"})
    amount!:number


    @Type(() => Date)
    @IsDate()
    giveDate!: Date;

    @IsOptional()
    @IsNumber()
    @IsPositiveNonZero({ message: "value must be greater than 0" })
    contractCurrencyExchangeRate!:number

    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    note?: string;
}

export class FinishPaymentRequest {

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    contractId!:number

    @Type(() => Date)
    @IsDate()
    giveDate!: Date;

    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    note?: string;
}