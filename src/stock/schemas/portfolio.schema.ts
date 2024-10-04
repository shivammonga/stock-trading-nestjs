import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type PortfolioDocument = HydratedDocument<Portfolio>;
@Schema({ timestamps: true })
export class Portfolio {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true })
    stockId: Types.ObjectId; // Reference to the Stock document

    @Prop({ required: true })
    quantity: number; // Number of shares held

    @Prop({ required: true })
    avgPrice: number; // Average price at which shares were bought
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
