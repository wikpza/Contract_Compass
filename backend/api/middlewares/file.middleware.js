"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHandlers = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.memoryStorage();
// Максимальный размер файла — 100MB
const uploadDocuments = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpeg', '.jpg', '.png', '.webp', '.pdf', '.docx', '.doc', '.xls', '.xlsx'];
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/msword', // Для .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Для .docx
            'application/vnd.ms-excel', // Для .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // Для .xlsx
        ];
        const extname = allowedExtensions.includes(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedMimeTypes.includes(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error(`Error: Unsupported file type. Allowed types: ${allowedExtensions.join(', ')}`));
        }
    }
}).array('documents', 10);
const uploadHandlers = (req, res, next) => {
    uploadDocuments(req, res, (err) => {
        if (err) {
            return res.status(400).send(err.message);
        }
        next();
    });
};
exports.uploadHandlers = uploadHandlers;
