import express, {NextFunction, Request, Response} from "express";
import cors from 'cors'
const app = express()
app.use(express.json())
app.use(cors())

app.get('/get', async(req:Request, res:Response, next:NextFunction)=>{
     res.status(200).json({message:"good"})
    return
})
export default app