import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, SchemaTypes } from "mongoose";
import { Stock } from "./stock.schema";

export type TradeDocument = HydratedDocument<Trade>;

@Schema({ timestamps: true })
export class Trade {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Stock", required: true })
    stock: Stock;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    date: Date;
}

export const TradeSchema = SchemaFactory.createForClass(Trade);
