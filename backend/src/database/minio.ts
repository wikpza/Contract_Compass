import { Client } from 'minio';
import dotenv from "dotenv";


dotenv.config();

const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY as string;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY as string;
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT as string;
const MINIO_PORT = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9009;


// Создаём клиента
export const minioClient = new Client({
    endPoint: MINIO_ENDPOINT, // IP или домен MinIO сервера
    port: MINIO_PORT,             // Порт, на котором работает MinIO
    useSSL: false,          // true, если используется HTTPS
    accessKey: MINIO_ACCESS_KEY,// Твой access key
    secretKey:MINIO_SECRET_KEY // Твой secret key
});

// Пример: проверка списка бакетов
export async function checkBucket() {
    const exists = await minioClient.bucketExists('file-docs');  // Исправленное имя
    if (!exists) {
        await minioClient.makeBucket('file-docs', 'us-east-1');
    }
}


