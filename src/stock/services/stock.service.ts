import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Stock } from "../schemas/stock.schema";
import { Model } from "mongoose";
import { Trade } from "../schemas/trade.schema";
import { Portfolio } from "../schemas/portfolio.schema";
import { TradeDto } from "../dto/trade.dto";
import { StockDto } from "../dto/stock.dto";

@Injectable()
export class StockService {
    constructor(
        @InjectModel(Stock.name) private stockModel: Model<Stock>,
        @InjectModel(Trade.name) private tradeModel: Model<Trade>,
        @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    ) {}

    // Add a stock
    async addStock(stockData: StockDto) {
        const stock = new this.stockModel(stockData);
        return await stock.save();
    }

    // Get all stocks
    async getAllStocks() {
        return await this.stockModel.find();
    }

    // Add a trade and update the user's portfolio
    async addTrade(tradeData: TradeDto): Promise<any> {
        const stock = await this.stockModel.findOne({ _id: tradeData.stockId });
        if (!stock) throw new Error("Stock not found");

        const trade = new this.tradeModel(tradeData);
        await trade.save();

        // Update the portfolio
        let portfolio = await this.portfolioModel.findOne({ stockId: tradeData.stockId });
        if (portfolio) {
            if (tradeData.type === "BUY") {
                portfolio["avgPrice"] = (portfolio["avgPrice"] * portfolio["quantity"] + tradeData.price * tradeData.quantity) / (portfolio["quantity"] + tradeData.quantity);
                portfolio["quantity"] = portfolio["quantity"] + tradeData.quantity;
            }
            if (tradeData.type === "SELL") {
                portfolio["quantity"] = portfolio["quantity"] - tradeData.quantity; // Decrease quantity
            }
            return await portfolio.save();
        } else {
            let data = {
                stockId: tradeData.stockId,
                quantity: tradeData.quantity,
                avgPrice: tradeData.price,
            };
            let portfolioDetails = new this.portfolioModel(data);
            return await portfolioDetails.save();
        }
    }

    // Get the user's portfolio (current holdings)
    async getPortfolio() {
        return this.portfolioModel.findOne().populate("holdings.stockId").exec();
    }

    // Get portfolio holdings
    async getHoldings() {
        let pipeline = [
            {
                $lookup: {
                    from: "portfolios",
                    localField: "stockId",
                    foreignField: "_id",
                    as: "stockDetails",
                },
            },
            {
                $unwind: {
                    path: "$stockDetails",
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $project: {
                    name: "$stockDetails.name",
                    symbol: "$stockDetails.symbol",
                    quantity: 1,
                    avgPrice: 1,
                },
            },
        ];
        let portfolio = await this.portfolioModel.aggregate(pipeline);
        return portfolio;
    }

    // Calculate returns for the portfolio
    async getReturns() {
        let pipeline = [
            {
                $facet: {
                    investedValue: [
                        {
                            $project: {
                                totalPrice: { $multiply: ["$quantity", "$avg_price"] },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalSum: { $sum: "$totalPrice" },
                            },
                        },
                    ],
                    currentValue: [
                        {
                            $lookup: {
                                from: "stocks",
                                localField: "stockId",
                                foreignField: "_id",
                                as: "stockDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$stockDetails",
                                preserveNullAndEmptyArrays: false,
                            },
                        },
                        {
                            $project: {
                                stockId: 1,
                                quantity: 1,
                                currentPrice: "$stockDetails.price",
                                cumulativeAmount: { $multiply: ["$quantity", "$stockDetails.price"] },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalCumulativeAmount: { $sum: "$cumulativeAmount" },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    investedValue: { $arrayElemAt: ["$investedValue.totalSum", 0] },
                    currentValue: { $arrayElemAt: ["$currentValue.totalCumulativeAmount", 0] },
                    PnL: {
                        $subtract: [{ $arrayElemAt: ["$currentValue.totalCumulativeAmount", 0] }, { $arrayElemAt: ["$investedValue.totalSum", 0] }],
                    },
                },
            },
        ];
        let investedValue = await this.portfolioModel.aggregate(pipeline);
        return investedValue;
    }

    // Add this method in the StockService class
    async updateTrade(tradeId: string, tradeData: Partial<Trade>): Promise<Trade> {
        const trade = await this.tradeModel.findById(tradeId).populate("stock");
        if (!trade) throw new Error("Trade not found");

        // Update the trade fields based on provided data
        trade.type = tradeData.type || trade.type;
        trade.price = tradeData.price || trade.price;
        trade.quantity = tradeData.quantity || trade.quantity;
        trade.createdAt = tradeData.createdAt || trade.createdAt;

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
