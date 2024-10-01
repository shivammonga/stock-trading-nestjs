import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Stock } from "../schemas/stock.schema";
import { Model } from "mongoose";
import { Trade } from "../schemas/trade.schema";
import { Portfolio } from "../schemas/portfolio.schema";

@Injectable()
export class StockService {
    constructor(
        @InjectModel(Stock.name) private stockModel: Model<Stock>,
        @InjectModel(Trade.name) private tradeModel: Model<Trade>,
        @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    ) {}

    // Add a stock
    async addStock(stockData: Partial<Stock>) {
        const stock = new this.stockModel(stockData);
        return await stock.save();
    }

    // Get all stocks
    async getAllStocks() {
        return await this.stockModel.find();
    }

    // Add a trade and update the user's portfolio
    async addTrade(tradeData: Partial<Trade>): Promise<Trade> {
        const stock = await this.stockModel.findOne({ symbol: tradeData.stock });
        if (!stock) throw new Error("Stock not found");

        const trade = new this.tradeModel({ ...tradeData, stock: stock._id });
        await trade.save();

        // Update the portfolio
        let portfolio = await this.portfolioModel.findOne();
        if (!portfolio) {
            portfolio = new this.portfolioModel({ holdings: [] });
        }

        // Check if the stock already exists in holdings
        const holdingIndex = portfolio.holdings.findIndex(h => h.stockId.equals(stock._id));
        if (holdingIndex !== -1) {
            const holding = portfolio.holdings[holdingIndex];
            if (tradeData.type === "BUY") {
                holding.quantity += tradeData.quantity; // Increase quantity
                holding.avgPrice = (holding.avgPrice * holding.quantity + tradeData.price * tradeData.quantity) / (holding.quantity + tradeData.quantity); // Recalculate average price
            } else if (tradeData.type === "SELL") {
                holding.quantity -= tradeData.quantity; // Decrease quantity
            }
            if (holding.quantity <= 0) portfolio.holdings.splice(holdingIndex, 1); // Remove if quantity is 0
        } else {
            // Add new holding if buying a new stock
            if (tradeData.type === "BUY") {
                portfolio.holdings.push({
                    stockId: stock._id,
                    symbol: stock.symbol,
                    quantity: tradeData.quantity,
                    avgPrice: tradeData.price,
                });
            }
        }

        await portfolio.save();
        return trade;
    }

    // Get the user's portfolio (current holdings)
    async getPortfolio() {
        return this.portfolioModel.findOne().populate("holdings.stockId").exec();
    }

    // Get portfolio holdings
    async getHoldings() {
        const portfolio = await this.getPortfolio();
        return portfolio ? portfolio.holdings : [];
    }

    // Calculate returns for the portfolio
    async getReturns() {
        const portfolio = await this.getPortfolio();
        const returns = portfolio.holdings.map(holding => {
            const finalPrice = 100; // Assume current market price is 100 for all stocks
            const totalInvestment = holding.avgPrice * holding.quantity;
            const currentValue = finalPrice * holding.quantity;
            const returnPercentage = ((currentValue - totalInvestment) / totalInvestment) * 100;
            return {
                stock: holding.symbol,
                returnPercentage,
            };
        });
        return returns;
    }

    // Add this method in the StockService class
    async updateTrade(tradeId: string, tradeData: Partial<Trade>): Promise<Trade> {
        const trade = await this.tradeModel.findById(tradeId).populate("stock");
        if (!trade) throw new Error("Trade not found");

        // Update the trade fields based on provided data
        trade.type = tradeData.type || trade.type;
        trade.price = tradeData.price || trade.price;
        trade.quantity = tradeData.quantity || trade.quantity;
        trade.date = tradeData.date || trade.date;

        await trade.save();
        return trade;
    }

    // Add this method in the StockService class
    async deleteTrade(tradeId: string): Promise<void> {
        const trade = await this.tradeModel.findById(tradeId);
        if (!trade) throw new Error("Trade not found");

        await this.tradeModel.deleteOne({ _id: tradeId });
    }
}
