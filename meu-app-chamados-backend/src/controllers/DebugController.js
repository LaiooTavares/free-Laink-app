// Path: MEU-APP-CHAMADOS-BACKEND/src/controllers/DebugController.js

const connection = require('../database/connection');

// ATENÇÃO: Este ficheiro é temporário e deve ser apagado após a correção.
class DebugController {
  async fixMigrations(request, response) {
    try {
      console.log("A tentar corrigir o diretório de migrações...");
      const migrationNamesToDelete = [
        '20250803003037_criar_tabela_contadores_os.js',
        '20250803003102_criar_tabela_contadores_os.js'
      ];
      console.log("A procurar pelos seguintes registos fantasmas:", migrationNamesToDelete);
      const result = await connection('knex_migrations').whereIn('name', migrationNamesToDelete).del();
      if (result > 0) {
        const message = `SUCESSO: ${result} registo(s) de migração fantasma foram removidos com sucesso.`;
        console.log(message);
        return response.status(200).send(message);
      } else {
        const message = `AVISO: Nenhum dos registos de migração fantasma foi encontrado. Pode já ter sido corrigido.`;
        console.log(message);
        return response.status(200).send(message);
      }
    } catch (error) {
      console.error("Erro ao tentar corrigir as migrações:", error);
      return response.status(500).json({ error: "Ocorreu um erro ao tentar corrigir a base de dados.", details: error.message });
    }
  }
}
module.exports = DebugController;
