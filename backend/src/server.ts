import dotenv from 'dotenv'
import expressApp from "./expressApp";
import sequelize from "./database";


dotenv.config()
const PORT  = process.env.PORT || 9000
export const StartServer = async()=>{
    expressApp.listen(PORT, ()=>{
        console.log("App is listening to :", PORT)
    })

    process.on('uncaughtException', async(err)=>{
        console.log(err)
        process.exit(1)
    })
}


StartServer().then(()=>{
    console.log('server is up')
    try {
        sequelize.sync().then(()=> {
            console.log("✅ Подключение к базе данных установлено успешно.")
        });
    } catch (error) {
        console.error("❌ Ошибка подключения к базе данных:", error);
    }
})