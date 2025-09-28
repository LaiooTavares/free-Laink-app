// MEU-APP-CHAMADOS-BACKEND/src/config/upload.js

const multer = require('multer');

// A principal mudança está aqui:
// Trocamos o multer.diskStorage (que salva em disco) pelo multer.memoryStorage().
// Isso mantém o arquivo na memória RAM do servidor como um "buffer" de dados.
// É muito mais rápido e eficiente, pois não precisamos salvar um arquivo temporário
// antes de enviá-lo para o armazenamento na nuvem (Cloudflare R2).
const storage = multer.memoryStorage();

// Aqui, criamos e exportamos a instância do multer já configurada.
// Podemos definir limites, como o tamanho máximo do arquivo (ex: 5MB).
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
});

module.exports = upload;