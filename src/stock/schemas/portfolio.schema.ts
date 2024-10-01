import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Stock } from "./stock.schema";

export type PortfolioDocument = HydratedDocument<Portfolio>;

@Schema()
export class StockHolding {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true })
    stockId: Types.ObjectId; // Reference to the Stock document

    @Prop({ required: true })
    symbol: string; // Stock symbol (e.g., 'AAPL')

    @Prop({ required: true })
    quantity: number; // Number of shares held

    @Prop({ required: true })
    avgPrice: number; // Average price at which shares were bought
}

@Schema({ timestamps: true })
export class Portfolio {
    @Prop([StockHolding]) // List of stock holdings
    holdings: StockHolding[];
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
