import dotenv from 'dotenv'
import expressApp from "./expressApp";
import sequelize from "./database";
import {syncDatabase} from "./database/models";
import {checkBucket} from "./database/minio";



dotenv.config()
const PORT  = process.env.PORT || 9000
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

const start = async () => {
    dotenv.config();

    const PORT = process.env.PORT || 9000;

    process.on('uncaughtException', (err) => {
        console.log('Uncaught Exception:', err);
        process.exit(1);
    });

    try {
        console.log('Connecting to the database...');
        await syncDatabase();
        await checkBucket();

        expressApp.listen(PORT, () => {
            console.log('✅ App is listening on port:', PORT);
        });

    } catch (error) {
        console.error('❌ Error starting the server:', error);
        process.exit(1);
    }
};

start();
