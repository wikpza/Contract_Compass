import express from "express";
import cors from 'cors'
import UnitRouter from './api/Unit.api'
import ApplicantRouter from './api/Applicant.api'
import PurchaserRouter from './api/Purchaser.api'
import CompanyRouter from './api/Company.api'
import ProductRouter from './api/Product.api'
import CurrencyRouter from './api/Currency.api'
import ProjectRouter from './api/Project.api'
import ContractRouter from './api/Contract.api'
import PaymentRouter from './api/Payment.api'
import InventoryRouter from './api/Inventory.api'
import FileRouter from './api/File.api'
import FileLinkRouter from './api/FileLink.api'

const app = express()
app.use(express.json())
app.use(cors())

app.use('/unit', UnitRouter)
app.use('/applicant', ApplicantRouter)
app.use("/purchaser", PurchaserRouter)
app.use("/company", CompanyRouter)
app.use("/product", ProductRouter)
app.use('/currency', CurrencyRouter)
app.use('/project', ProjectRouter)
app.use('/contract', ContractRouter)
app.use('/payment', PaymentRouter)
app.use('/inventory', InventoryRouter)
app.use('/file', FileRouter)
app.use('/doc/link',FileLinkRouter )

export default app