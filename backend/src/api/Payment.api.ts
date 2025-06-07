import express, {Request, Response, NextFunction} from "express";
import {UnitRepository} from "../repository/Unit.repository";
import {BaseError} from "../utils/error";
import {logger} from "../utils/logger";
import {RequestValidator} from "../utils/requestValidator";
import {CreateUnitRequest, UpdateUnitRequest} from "../dto/Unit.dto";
import {ApplicantRepository} from "../repository/Applicant.repository";
import {CreateApplicantRequest, UpdateApplicantRequest} from "../dto/Applicant.dto";
import {PaymentRepository} from "../repository/Payment.repository";
import {CreatePaymentRequest, FinishPaymentRequest} from "../dto/Payment.dto";


const router = express.Router()
const repository = new PaymentRepository()

router.post("/",
    async (req:Request, res:Response):Promise<any>=>{
        try{
            console.log(req.body)
            const {errors, input} = await RequestValidator(
                CreatePaymentRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})
            const result = await repository.createPayment(
               req.body
            )
            return res.status(201).json(result)
        }catch(error){
            const err = error as BaseError
            logger.error(err)
            return res.status(err.status).json({message:err.message,details:err.details || {}})
        }
    })


router.post("/finish",
    async (req:Request, res:Response):Promise<any>=>{
        try{
            console.log(req.body)
            const {errors, input} = await RequestValidator(
                FinishPaymentRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})
            const result = await repository.finishPayment(
                req.body
            )
            return res.status(201).json(result)
        }catch(error){
            const err = error as BaseError
            logger.error(err)
            return res.status(err.status).json({message:err.message,details:err.details || {}})
        }
    })

router.patch("/:id",
    async (req:Request, res:Response):Promise<any>=>{
        try{

            const id =  parseInt(req.params.id)

            if (isNaN(id)) {
                return res.status(400).json({ message: "Id должно быть числом",
                    details:{id:["Id должно быть числом"]}});
            }

            const result = await repository.cancelPayment(
                { id}
            )
            return res.status(201).json(result)
        }catch(error){
            const err = error as BaseError
            logger.error(err)
            return res.status(err.status).json({message:err.message,details:err.details || {}})
        }
    })

router.get("/",
    async (req: Request, res: Response): Promise<any> => {
        try {
            // Явно типизируем параметры запроса
            const {
                page,
                limit,
                searchValue,
                sortBy,
                searchBy,
                sortType
            } = req.query as {
                page?: string;
                limit?: string;
                searchValue?: string;
                sortBy?: string;
                searchBy?: string;
                sortType?: 'ASC' | 'DESC' | string;
            };

            const parsedPage = page ? parseInt(page, 10) : undefined;
            const parsedLimit = limit ? parseInt(limit, 10) : undefined;
            const parsedSortType = sortType === "ASC" || sortType === "DESC" ? sortType : "ASC";
            const parsedSortBy = sortBy || "createdAt";

            const response = await repository.getPayment({
                page: parsedPage,
                limit: parsedLimit,
                sortType: parsedSortType,
                sortBy: parsedSortBy,
                searchValue: searchValue,
                searchBy: searchBy
            });

            return res.status(200).json(response); // Обычно для GET используется 200, а не 201
        } catch (error) {
            const err = error as BaseError;
            logger.error(err);
            return res.status(err.status || 500).json({
                message: err.message,
                details: err.details || {}
            });
        }
    });


export default router