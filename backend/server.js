"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const expressApp_1 = __importDefault(require("./expressApp"));
const models_1 = require("./database/models");
const minio_1 = require("./database/minio");
dotenv_1.default.config();
const PORT = process.env.PORT || 9000;
// export const StartServer = async()=>{
//     expressApp.listen(PORT, ()=>{
//         console.log("App is listening to :", PORT)
//     })
//
//     process.on('uncaughtException', async(err)=>{
//         console.log(err)
//         process.exit(1)
//     })
// }
//
//
// StartServer().then(async () => {
//
//     console.log('server is up');
//
//     try {
//
//         // sequelize.sync({alter:true, force:true})
//         console.log('Connection has been established successfully.');
//         await syncDatabase()
//         await checkBucket()
//
//     } catch (error) {
//         console.error("❌ Ошибка подключения к базе данных:", error);
//
//         if (error && typeof error === "object" && "errors" in error && Array.isArray(error.errors)) {
//             console.log("\n🔍 Детали ошибок:");
//             for (const err of error.errors) {
//                 console.error(`• ${err.message}`);
//             }
//         }
//
//         if (error instanceof Error) {
//             console.error("🧵 Стек:", error.stack);
//         }
//     }
//
// });
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    dotenv_1.default.config();
    const PORT = process.env.PORT || 9000;
    process.on('uncaughtException', (err) => {
        console.log('Uncaught Exception:', err);
        process.exit(1);
    });
    try {
        console.log('Connecting to the database...');
        yield (0, models_1.syncDatabase)();
        yield (0, minio_1.checkBucket)();
        expressApp_1.default.listen(PORT, () => {
            console.log('✅ App is listening on port:', PORT);
        });
    }
    catch (error) {
        console.error('❌ Error starting the server:', error);
        process.exit(1);
    }
});
start();
