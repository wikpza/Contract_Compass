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
const Contract_repository_1 = require("../repository/Contract.repository");
const Contract_dto_1 = require("../dto/Contract.dto");
const router = express_1.default.Router();
const repository = new Contract_repository_1.ContractRepository();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { errors, input } = yield (0, requestValidator_1.RequestValidator)(Contract_dto_1.CreateContractRequest, req.body);
        if (errors)
            return res.status(400).json({ message: "bad request", details: errors || {} });
        const result = yield repository.createContract(req.body);
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
        const { errors, input } = yield (0, requestValidator_1.RequestValidator)(Contract_dto_1.UpdateContractRequest, req.body);
        if (errors)
            return res.status(400).json({ message: "bad request", details: errors || {} });
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Id должно быть числом",
                details: { id: ["Id должно быть числом"] } });
        }
        const result = yield repository.updateContract(Object.assign(Object.assign({}, req.body), { id }));
        return res.status(201).json(result);
    }
    catch (error) {
        const err = error;
        logger_1.logger.error(err);
        return res.status(err.status).json({ message: err.message, details: err.details || {} });
    }
}));
router.patch("/status/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { errors, input } = yield (0, requestValidator_1.RequestValidator)(Contract_dto_1.UpdateStatusContractRequest, req.body);
        if (errors)
            return res.status(400).json({ message: "bad request", details: errors || {} });
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Id должно быть числом",
                details: { id: ["Id должно быть числом"] } });
        }
        const result = yield repository.changeStatus({ status: (_a = req.body) === null || _a === void 0 ? void 0 : _a.status, id });
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
        const { page, limit, searchValue, sortBy, searchBy, sortType, type } = req.query;
        const id = parseInt(req.query.projectId);
        const parsedPage = page ? parseInt(page, 10) : undefined;
        const parsedLimit = limit ? parseInt(limit, 10) : undefined;
        const parsedSortType = sortType === "ASC" || sortType === "DESC" ? sortType : "ASC";
        const parsedSortBy = sortBy || "createdAt";
        const parsedType = type === 'product' || type === 'service' ? type : undefined;
        const response = yield repository.getContract({
            page: parsedPage,
            limit: parsedLimit,
            sortType: parsedSortType,
            sortBy: parsedSortBy,
            searchValue: searchValue,
            searchBy: searchBy,
            type: parsedType,
            projectId: id
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
        const response = yield repository.deleteContract({ id: id });
        return res.status(201).json(response);
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
            return res.status(400).json({ message: "Invalid ID format",
                details: { id: ["Invalid ID format"] } });
        }
        const response = yield repository.getContractDetail({
            id
        });
        return res.status(200).json(response);
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
exports.default = router;
