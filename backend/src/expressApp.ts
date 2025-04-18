import express from "express";
import cors from 'cors'
import UnitRouter from '../src/api/Unit.api'
import ApplicantRouter from '../src/api/Applicant.api'
import PurchaserRouter from '../src/api/Purchaser.api'
import CompanyRouter from '../src/api/Company.api'
import ProductRouter from '../src/api/Product.api'

const app = express()
app.use(express.json())
app.use(cors())

app.use('/unit', UnitRouter)
app.use('/applicant', ApplicantRouter)
app.use("/purchaser", PurchaserRouter)
app.use("/company", CompanyRouter)
app.use("/product", ProductRouter)

export default app