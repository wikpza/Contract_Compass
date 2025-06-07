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
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const requestValidator_1 = require("../utils/requestValidator");
const file_middleware_1 = require("./middlewares/file.middleware");
const File_repository_1 = require("../repository/File.repository");
const File_dto_1 = require("../dto/File.dto");
const router = express_1.default.Router();
const repository = new File_repository_1.FileRepository();
router.post("/", file_middleware_1.uploadHandlers, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = parseInt((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.contractId);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Id должно быть числом",
                details: { id: ["Id должно быть числом"] } });
        }
        if (!req.files) {
            return res.status(401).json({ message: "Не добавили файлы" });
        }
        // Если uploadHandlers настроен на один файл/поле
        const files = Array.isArray(req.files)
            ? req.files
            : req.files['files']; // или другое имя поля
        if (!files || files.length === 0) {
            return res.status(401).json({ message: "Не добавили файлы" });
        }
        const result = yield repository.addFile({
            contractId: id, // Убедитесь, что это правильное значение
            files: files
        });
        return res.status(201).json(result);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status).json({
            message: err.message,
            details: err.details || {}
        });
    }
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { errors, input } = yield (0, requestValidator_1.RequestValidator)(File_dto_1.UpdateFileRequest, req.body);
        if (errors)
            return res.status(400).json({ message: "bad request", details: errors || {} });
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Id должно быть числом",
                details: { id: ["Id должно быть числом"] } });
        }
        const result = yield repository.updateFile(Object.assign(Object.assign({}, req.body), { id }));
        return res.status(201).json(result);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status).json({ message: err.message, details: err.details || {} });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Явно типизируем параметры запроса
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Id должно быть числом",
                details: { id: ["Id должно быть числом"] } });
        }
        const response = yield repository.getFile({ id });
        res.setHeader('Content-Type', response.stat.metaData['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Length', response.stat.size);
        res.setHeader('Content-Disposition', `attachment; filename="${response.stat.metaData['original-name'] || id}"`);
        response.file.pipe(res);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status || 500).json({
            message: err.message,
            details: err.details || {}
        });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Явно типизируем параметры запроса
        const { page, limit, searchValue, sortBy, searchBy, sortType, } = req.query;
        const id = parseInt(req.query.contractId);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format",
                details: { id: ["Invalid ID format"] } });
        }
        const parsedPage = page ? parseInt(page, 10) : undefined;
        const parsedLimit = limit ? parseInt(limit, 10) : undefined;
        const parsedSortType = sortType === "ASC" || sortType === "DESC" ? sortType : "ASC";
        const parsedSortBy = sortBy || "createdAt";
        const response = yield repository.getFiles({
            page: parsedPage,
            limit: parsedLimit,
            sortType: parsedSortType,
            sortBy: parsedSortBy,
            searchValue: searchValue,
            searchBy: searchBy,
            contractId: id
        });
        return res.status(200).json(response); // Обычно для GET используется 200, а не 201
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status || 500).json({
            message: err.message,
            details: err.details || {}
        });
    }
}));
router.delete("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format",
                details: { id: ["Invalid ID format"] } });
        }
        const response = yield repository.deleteFile({ id: id });
        return res.status(201).json(response);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status).json({ message: err.message, details: err.details || {} });
    }
}));
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
exports.default = router;
