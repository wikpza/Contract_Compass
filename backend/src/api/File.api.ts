import express, {Request, Response, NextFunction} from "express";
import {UnitRepository} from "../repository/Unit.repository";
import {BaseError} from "../utils/error";
import {logger} from "../utils/logger";
import {RequestValidator} from "../utils/requestValidator";
import {CreateUnitRequest, UpdateUnitRequest} from "../dto/Unit.dto";
import {ApplicantRepository} from "../repository/Applicant.repository";
import {CreateApplicantRequest, UpdateApplicantRequest} from "../dto/Applicant.dto";
import {ProjectRepository} from "../repository/Project.repository";
import {CreateProjectRequest, UpdateProjectRequest} from "../dto/Project.dto";
import {uploadHandlers} from "./middlewares/file.middleware";
import {FileRepository} from "../repository/File.repository";
import {minioClient} from "../database/minio";
import {UpdateCompanyRequest} from "../dto/Company.dto";
import {AddFileRequest, UpdateFileRequest} from "../dto/File.dto";


const router = express.Router()
const repository = new FileRepository()

router.post("/",
    uploadHandlers,
    async (req: Request, res: Response): Promise<any> => {
        try {

            const id =  parseInt(req?.body?.contractId)

            if (isNaN(id)) {
                return res.status(400).json({ message: "Id должно быть числом",
                    details:{id:["Id должно быть числом"]}});
            }


            if (!req.files) {
                return res.status(401).json({message:"Не добавили файлы"})
            }

            // Если uploadHandlers настроен на один файл/поле
            const files = Array.isArray(req.files)
                ? req.files
                : req.files['files']; // или другое имя поля

            if (!files || files.length === 0) {
                return res.status(401).json({message:"Не добавили файлы"})
            }

            const result = await repository.addFile({
                contractId: id, // Убедитесь, что это правильное значение
                files: files
            });

            return res.status(201).json(result);
        } catch(error) {
            const err = error as BaseError;
            logger.error(err);
            return res.status(err.status).json({
                message: err.message,
                details: err.details || {}
            });
        }
    }
);

router.patch("/:id",
    async (req:Request, res:Response):Promise<any>=>{
        try{
            const {errors, input} = await RequestValidator(
                UpdateFileRequest,
                req.body
            )
            if(errors) return res.status(400).json({message:"bad request",details:errors || {}})

            const id =  parseInt(req.params.id)

            if (isNaN(id)) {
                return res.status(400).json({ message: "Id должно быть числом",
                    details:{id:["Id должно быть числом"]}});
            }

            const result = await repository.updateFile(
                {...req.body, id}
            )
            return res.status(201).json(result)
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
                return res.status(400).json({ message: "Id должно быть числом",
                    details:{id:["Id должно быть числом"]}});
            }


            const response = await repository.getFile({id})

            res.setHeader('Content-Type', response.stat.metaData['content-type'] || 'application/octet-stream');
            res.setHeader('Content-Length', response.stat.size);
            res.setHeader('Content-Disposition', `attachment; filename="${response.stat.metaData['original-name'] || id}"`);

            response.file.pipe(res);
        } catch (error) {
            const err = error as BaseError;
            logger.error(err);
            return res.status(err.status || 500).json({
                message: err.message,
                details: err.details || {}
            });
        }
    });

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
            } = req.query as {
                page?: string;
                limit?: string;
                searchValue?: string;
                sortBy?: string;
                searchBy?: string;
                sortType?: 'ASC' | 'DESC' | string;
            };

            const id =  parseInt(req.query.contractId as string)
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid ID format",
                    details:{id:["Invalid ID format"]}});
            }

            const parsedPage = page ? parseInt(page, 10) : undefined;
            const parsedLimit = limit ? parseInt(limit, 10) : undefined;
            const parsedSortType = sortType === "ASC" || sortType === "DESC" ? sortType : "ASC";
            const parsedSortBy = sortBy || "createdAt";


            const response = await repository.getFiles({
                page: parsedPage,
                limit: parsedLimit,
                sortType: parsedSortType,
                sortBy: parsedSortBy,
                searchValue: searchValue,
                searchBy: searchBy,
                contractId:id
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
            const response = await repository.deleteFile({id:id})

            return res.status(201).json(response)
        }catch(error){
            const err = error as BaseError
            logger.error(err)
            return res.status(err.status).json({message:err.message,details:err.details || {}})
        }
    })


// router.get("/:id",
//     async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
//         try{
//
//             const id =  parseInt(req.params.id)
//             if (isNaN(id)) {
//                 return res.status(400).json({ message: "Invalid ID format",
//                     details:{id:["Invalid ID format"]}});
//             }
//             const response = await repository.getProjectDetail({id:id})
//             console.log(response)
//             return res.status(201).json(response)
//         }catch(error){
//             const err = error as BaseError
//             logger.error(err)
//             return res.status(err.status).json({message:err.message,details:err.details || {}})
//         }
//     })
export default router