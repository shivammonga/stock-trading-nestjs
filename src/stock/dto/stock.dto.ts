import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class StockDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsNumber()
    price: number;
}
