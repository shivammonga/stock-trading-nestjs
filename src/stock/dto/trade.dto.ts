import { IsEnum, IsInt, IsMongoId, IsNumber } from "class-validator";

export class TradeDto {
    @IsMongoId({ message: "Required valid stock details" })
    stockId: string;

    @IsEnum(["BUY", "SELL"], { message: "Invalid transaction" })
    type: string;

    @IsNumber({}, { message: "Invalid price" })
    price: number;

    @IsNumber({}, { message: "Invalid quantity" })
    quantity: number;
}
