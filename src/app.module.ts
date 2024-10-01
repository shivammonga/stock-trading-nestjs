import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { StockModule } from "./stock/stock.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: () => ({
                uri: process.env.MONGODB_URI,
            }),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        StockModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
