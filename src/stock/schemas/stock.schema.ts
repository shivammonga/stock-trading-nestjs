import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type StockDocument = HydratedDocument<Stock>;

@Schema({ timestamps: true })
export class Stock {
    @Prop({ required: true, unique: true })
    symbol: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    price: number;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
