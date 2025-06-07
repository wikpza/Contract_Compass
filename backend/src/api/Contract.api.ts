import express, {Request, Response, NextFunction} from "express";
import {BaseError} from "../utils/error";
import {logger} from "../utils/logger";
import {RequestValidator} from "../utils/requestValidator";
import {ContractRepository} from "../repository/Contract.repository";
import {CreateContractRequest, UpdateContractRequest, UpdateStatusContractRequest} from "../dto/Contract.dto";


const router = express.Router()
const repository = new ContractRepository()

router.post("/",
    async (req:Request, res:Response):Promise<any>=>{
        try{
            const {errors, input} = await RequestValidator(
                CreateContractRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})
            const result = await repository.createContract(
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
            const {errors, input} = await RequestValidator(
                UpdateContractRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})

            const id =  parseInt(req.params.id, 10)

            if (isNaN(id)) {
                return res.status(400).json({ message: "Id должно быть числом",
                    details:{id:["Id должно быть числом"]}});
            }


            const result = await repository.updateContract(
                {...req.body , id}
            )
            return res.status(201).json(result)
        }catch(error){
            const err = error as BaseError
            logger.error(err)
            return res.status(err.status).json({message:err.message,details:err.details || {}})
        }
    })

router.patch("/status/:id",
    async (req:Request, res:Response):Promise<any>=>{
        try{
            const {errors, input} = await RequestValidator(
                UpdateStatusContractRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})

            const id =  parseInt(req.params.id, 10)

            if (isNaN(id)) {
                return res.status(400).json({ message: "Id должно быть числом",
                    details:{id:["Id должно быть числом"]}});
            }


            const result = await repository.changeStatus(
                {status:req.body?.status , id}
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
                sortType,
                type
            } = req.query as {
                page?: string;
                limit?: string;
                searchValue?: string;
                sortBy?: string;
                searchBy?: string;
                sortType?: 'ASC' | 'DESC' | string;
                type?:'product' | 'service' | string,
            };

            const id =  parseInt(req.query.projectId as string)

            const parsedPage = page ? parseInt(page, 10) : undefined;
            const parsedLimit = limit ? parseInt(limit, 10) : undefined;
            const parsedSortType = sortType === "ASC" || sortType === "DESC" ? sortType : "ASC";
            const parsedSortBy = sortBy || "createdAt";
            const parsedType = type === 'product' || type === 'service' ? type : undefined

            const response = await repository.getContract({
                page: parsedPage,
                limit: parsedLimit,
                sortType: parsedSortType,
                sortBy: parsedSortBy,
                searchValue: searchValue,
                searchBy: searchBy,
                type: parsedType,
                projectId:id
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

router.delete("/:id",
    async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
        try{

            const id =  parseInt(req.params.id)
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid ID format",
                    details:{id:["Invalid ID format"]}});
            }
            const response = await repository.deleteContract({id:id})

            return res.status(201).json(response)
        }catch(error){
            const err = error as BaseError
            logger.error(err)
            return res.status(err.status).json({message:err.message,details:err.details || {}})
        }
    })

router.get("/:id",
    async (req: Request, res: Response): Promise<any> => {
        try {
            // Явно типизируем параметры запроса
            const id =  parseInt(req.params.id)
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid ID format",
                    details:{id:["Invalid ID format"]}});
            }


            const response = await repository.getContractDetail({
               id
            });

            return res.status(200).json(response);
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