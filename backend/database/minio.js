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
Object.defineProperty(exports, "__esModule", { value: true });
exports.minioClient = void 0;
exports.checkBucket = checkBucket;
const minio_1 = require("minio");
// Создаём клиента
exports.minioClient = new minio_1.Client({
    endPoint: 'localhost', // IP или домен MinIO сервера
    port: 9009, // Порт, на котором работает MinIO
    useSSL: false, // true, если используется HTTPS
    accessKey: 'minioadmin', // Твой access key
    secretKey: 'minioadmin' // Твой secret key
});
// Пример: проверка списка бакетов
function checkBucket() {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield exports.minioClient.bucketExists('file-docs'); // Исправленное имя
        if (!exists) {
            yield exports.minioClient.makeBucket('file-docs', 'us-east-1');
        }
    });
}
