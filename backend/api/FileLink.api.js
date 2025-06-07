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
const FileLink_dto_1 = require("../dto/FileLink.dto");
const FileLink_repository_1 = require("../repository/FileLink.repository");
const router = express_1.default.Router();
const repository = new FileLink_repository_1.FileLinkRepository();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { errors, input } = yield (0, requestValidator_1.RequestValidator)(FileLink_dto_1.CreateFileLinkRequest, req.body);
        if (errors)
            return res.status(400).json({ message: "bad request", details: errors || {} });
        const result = yield repository.createFileLink(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status).json({ message: err.message, details: err.details || {} });
    }
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { errors, input } = yield (0, requestValidator_1.RequestValidator)(FileLink_dto_1.UpdateFileLinkRequest, req.body);
        if (errors)
            return res.status(400).json({ message: "bad request", details: errors || {} });
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Id должно быть числом",
                details: { id: ["Id должно быть числом"] } });
        }
        const result = yield repository.updateFileLink(Object.assign(Object.assign({}, req.body), { id }));
        return res.status(201).json(result);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status).json({ message: err.message, details: err.details || {} });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Явно типизируем параметры запроса
        const { page, limit, searchValue, sortBy, searchBy, sortType, contractId } = req.query;
        if (!contractId)
            return res.status(403).json({ message: "Не указан контракт" });
        const parsedPage = page ? parseInt(page, 10) : undefined;
        const parsedContractId = parseInt(contractId, 10);
        const parsedLimit = limit ? parseInt(limit, 10) : undefined;
        const parsedSortType = sortType === "ASC" || sortType === "DESC" ? sortType : "ASC";
        const parsedSortBy = sortBy || "createdAt";
        const response = yield repository.getFileLink({
            page: parsedPage,
            limit: parsedLimit,
            sortType: parsedSortType,
            sortBy: parsedSortBy,
            searchValue: searchValue,
            searchBy: searchBy,
            contractId: parsedContractId
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
        const response = yield repository.deleteFileLink({ id: id });
        return res.status(201).json(response);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status).json(JSON.stringify({ message: err.message, details: err.details || {} }, null, 2));
    }
}));
exports.default = router;
