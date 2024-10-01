import { Module } from "@nestjs/common";
import { StockService } from "./services/stock.service";
import { StockController } from "./controller/stock.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Stock, StockSchema } from "./schemas/stock.schema";
import { Trade, TradeSchema } from "./schemas/trade.schema";
import { Portfolio, PortfolioSchema } from "./schemas/portfolio.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Stock.name, schema: StockSchema },
            { name: Trade.name, schema: TradeSchema },
            { name: Portfolio.name, schema: PortfolioSchema },
        ]),
    ],
    providers: [StockService],
    controllers: [StockController],
})
export class StockModule {}
