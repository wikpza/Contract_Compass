import express, {Request, Response, NextFunction} from "express";
import {UnitRepository} from "../repository/Unit.repository";
import {BaseError} from "../utils/error";
import {logger} from "../utils/logger";
import {RequestValidator} from "../utils/requestValidator";
import {CreateUnitRequest, UpdateUnitRequest} from "../dto/Unit.dto";
import {ApplicantRepository} from "../repository/Applicant.repository";
import {CreateApplicantRequest, UpdateApplicantRequest} from "../dto/Applicant.dto";
import {CreateFileLinkRequest, UpdateFileLinkRequest} from "../dto/FileLink.dto";
import {FileLinkRepository} from "../repository/FileLink.repository";


const router = express.Router()
const repository = new FileLinkRepository()

router.post("/",
    async (req:Request, res:Response):Promise<any>=>{
        try{
            console.log(req.body)
            const {errors, input} = await RequestValidator(
                CreateFileLinkRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})
            const result = await repository.createFileLink(
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
                UpdateFileLinkRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})

            const id =  parseInt(req.params.id)

            if (isNaN(id)) {
                return res.status(400).json({ message: "Id должно быть числом",
                    details:{id:["Id должно быть числом"]}});
            }

            const result = await repository.updateFileLink(
                {...req.body, id}
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
                contractId
            } = req.query as {
                page?: string;
                limit?: string;
                searchValue?: string;
                sortBy?: string;
                searchBy?: string;
                sortType?: 'ASC' | 'DESC' | string;
                contractId?:string
            };
            if(!contractId) return res.status(403).json({message:"Не указан контракт"})
            const parsedPage = page ? parseInt(page, 10) : undefined;
            const parsedContractId = parseInt(contractId, 10);
            const parsedLimit = limit ? parseInt(limit, 10) : undefined;
            const parsedSortType = sortType === "ASC" || sortType === "DESC" ? sortType : "ASC";
            const parsedSortBy = sortBy || "createdAt";

            const response = await repository.getFileLink({
                page: parsedPage,
                limit: parsedLimit,
                sortType: parsedSortType,
                sortBy: parsedSortBy,
                searchValue: searchValue,
                searchBy: searchBy,
                contractId:parsedContractId
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
            const response = await repository.deleteFileLink({id:id})

            return res.status(201).json(response)
        }catch(error){
            const err = error as BaseError
            logger.error(err)
            return res.status(err.status).json(JSON.stringify({message:err.message,details:err.details || {}}, null, 2))
        }
    })


export default router