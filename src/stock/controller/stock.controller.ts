import { Body, Controller, Get, Post } from "@nestjs/common";
import { Stock } from "../schemas/stock.schema";
import { StockService } from "../services/stock.service";
import { Trade } from "../schemas/trade.schema";

@Controller("stock")
export class StockController {
    constructor(private readonly stockService: StockService) {}

    // Add a stock
    @Post("/add")
    async addStock(@Body() stockData: Partial<Stock>) {
        return await this.stockService.addStock(stockData);
    }

    // Get all stocks
    @Get()
    async getAllStocks() {
        return await this.stockService.getAllStocks();
    }

    // Add a trade
    @Post("/addTrade")
    async addTrade(@Body() tradeData: Partial<Trade>) {
        return await this.stockService.addTrade(tradeData);
    }

    // Get portfolio holdings
    @Get("/portfolio/holdings")
    async getHoldings() {
        return await this.stockService.getHoldings();
    }

    // Get portfolio returns
    @Get("/portfolio/returns")
    async getReturns() {
        return await this.stockService.getReturns();
    }
}
