import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import sharp from "sharp";

const storage = multer.memoryStorage();

// Максимальный размер файла — 100MB
const uploadDocuments = multer({
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

        const extname = allowedExtensions.includes(
            path.extname(file.originalname).toLowerCase()
        );

        const mimetype = allowedMimeTypes.includes(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error(
                `Error: Unsupported file type. Allowed types: ${allowedExtensions.join(', ')}`
            ));
        }
    }
}).array('documents', 10);

export const uploadHandlers = (req: Request, res: Response, next: NextFunction) => {
    uploadDocuments(req, res, (err) => {
        if (err) {
            return res.status(400).send(err.message);
        }
        next();
    });
}



