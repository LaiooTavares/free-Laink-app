// MEU-APP-CHAMADOS-BACKEND/src/services/R2StorageService.js
/*
// O CONTEÚDO DESTE ARQUIVO FOI DESATIVADO PARA A VERSÃO SIMPLIFICADA
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require('crypto');
const path = require('path');

const requiredEnv = ['R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente obrigatória '${key}' não está definida.`);
  }
}

const s3Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

class R2StorageService {
  async saveFile(file) {
    const fileHash = crypto.randomBytes(10).toString('hex');
    const fileExtension = path.extname(file.originalname);
    const fileName = `${fileHash}${fileExtension}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      return `${publicUrl}/${fileName}`;
    } catch (error) {
      console.error("Erro ao fazer upload para o R2:", error);
      throw new Error("Falha ao salvar o arquivo na nuvem.");
    }
  }
}

module.exports = new R2StorageService();
*/

// Para a versão simplificada, exportamos um objeto vazio para não quebrar as importações.
module.exports = {};