import {IsNotEmpty, IsString, IsOptional, MaxLength, IsInt, Min, IsNumber, IsDate, IsIn} from "class-validator";
import {Type} from "class-transformer";
import {IsPositiveNonZero} from "../utils";

export class UpdateContractRequest {

    @IsNotEmpty({ message: 'Type is required' })
    @IsIn(['product', 'service'], {
        message: 'Type must be either "product" or "service"'
    })
    type!: 'product' | 'service';


    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MaxLength(100, { message: 'Name must be shorter than or equal to 100 characters' })
    name!: string;

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    projectId!:number

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    applicantId!:number

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    purchaserId!:number

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    companyId!:number

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    currencyId!:number

    @IsNumber()
    @Min(0, {message:"id must be greater or equal than 0"})
    amount!:number



    @Type(() => Date)
    @IsDate()
    signDate!: Date;

    @Type(() => Date)
    @IsDate()
    officialBeginDate!: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    officialFinishDate!: Date;


    @IsOptional()
    @IsNumber()
    @IsPositiveNonZero({ message: "value must be greater than 0" })
    projectCurrencyExchangeRate!:number


    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    note?: string;


}

export class CreateContractRequest extends UpdateContractRequest {}

export class UpdateStatusContractRequest  {
    @IsNotEmpty({ message: 'Status is required' })
    @IsIn(["active", "completed", 'canceled'], {
        message: 'Status must be either "cancel" or "active"'
    })
    status!: 'canceled' | 'active' | "completed";

}