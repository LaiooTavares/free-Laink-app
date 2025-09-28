// MEU-APP-CHAMADOS-BACKEND/src/controllers/ConfiguracoesController.js
const connection = require('../database/connection');
const fs = require('fs');
const path = require('path');
const uploadConfig = require('../config/upload');

module.exports = {
  // ... (outros métodos como getPrefixes, getBranding, etc. permanecem inalterados) ...
  async getPrefixes(request, response) {
    try {
      const chaves = ['os_prefixo_chamado', 'os_prefixo_servico'];
      const settings = await connection('configuracoes').whereIn('chave', chaves).select('chave', 'valor');
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.chave] = setting.valor;
        return acc;
      }, {});
      return response.json({
        chamadoPrefix: settingsMap.os_prefixo_chamado || 'CH',
        servicoPrefix: settingsMap.os_prefixo_servico || 'SV',
      });
    } catch (error) {
      console.error("ERRO ao buscar prefixos de OS:", error.message);
      return response.status(500).json({ error: "Falha ao consultar os prefixos." });
    }
  },

  async getBranding(request, response) {
    try {
      const brandingSettings = await connection('configuracoes')
        .whereIn('chave', ['logo_dashboard_url', 'favicon_url'])
        .select('chave', 'valor');
      const brandingMap = brandingSettings.reduce((acc, setting) => {
        acc[setting.chave] = setting.valor;
        return acc;
      }, {});
      return response.json({
        logo_dashboard_url: brandingMap.logo_dashboard_url || null,
        favicon_url: brandingMap.favicon_url || null,
      });
    } catch (error) {
      console.error("ERRO ao buscar configurações de branding:", error.message);
      return response.status(500).json({ error: "Falha ao consultar as configurações de branding." });
    }
  },

  async updateBrandingImage(request, response) {
    try {
      const { type } = request.params;
      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }
      const chave = type === 'logo' ? 'logo_dashboard_url' : 'favicon_url';
      const settingAtual = await connection('configuracoes').where({ chave }).first();
      if (!settingAtual) {
        fs.unlinkSync(file.path);
        return response.status(404).json({ error: 'Configuração de branding não encontrada.' });
      }
      if (settingAtual.valor) {
        const oldFilePath = path.join(uploadConfig.directory, path.basename(settingAtual.valor));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      const fileUrl = `/files/${file.filename}`;
      await connection('configuracoes').where({ chave }).update({ valor: fileUrl });
      return response.status(200).json({ [chave]: fileUrl });
    } catch (error) {
      console.error(`Erro ao fazer upload de ${request.params.type}:`, error);
      return response.status(500).json({ error: 'Ocorreu um erro interno durante o upload.' });
    }
  },

  async getWebhookUrl(request, response) {
    try {
      const webhookSetting = await connection('configuracoes').where('chave', 'webhookUrl').first();
      const webhookUrl = webhookSetting ? webhookSetting.valor : '';
      return response.json({ webhookUrl });
    } catch (error) {
      console.error("ERRO GRAVE ao buscar URL do webhook:", error.message);
      return response.status(500).json({ error: "Falha ao consultar a URL do webhook." });
    }
  },

  async getSettings(request, response) {
    try {
      const settings = await connection('configuracoes').select('*');
      const settingsMap = settings.reduce((acc, setting) => { acc[setting.chave] = setting.valor; return acc; }, {});
      const fullSettings = {
        webhookUrl: settingsMap.webhookUrl || '',
        os_prefixo_chamado: settingsMap.os_prefixo_chamado || 'CH',
        os_prefixo_servico: settingsMap.os_prefixo_servico || 'SV',
        default_theme_key: settingsMap.default_theme_key || null,
        // <<-- ALTERAÇÃO: A chave 'config_card_color' foi removida daqui -->>
      };
      return response.json(fullSettings);
    } catch (error) {
      console.error("ERRO GRAVE ao buscar configurações:", error.message);
      return response.status(500).json({ error: "Falha ao consultar as configurações no servidor." });
    }
  },
  
  async updateSettings(request, response) {
    // Nenhuma alteração necessária aqui, a função já é genérica
    const settings = request.body;
    if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
      return response.status(400).json({ error: 'Corpo da requisição inválido ou vazio.' });
    }
    const trx = await connection.transaction();
    try {
      for (const [chave, valor] of Object.entries(settings)) {
        const existing = await trx('configuracoes').where('chave', chave).first();
        if (existing) {
          await trx('configuracoes').where('chave', chave).update({ valor });
        } else {
          await trx('configuracoes').insert({ chave, valor });
        }
      }
      await trx.commit();
      return response.status(200).json({ message: 'Configurações atualizadas com sucesso.' });
    } catch (error) {
      await trx.rollback();
      console.error("[CONTROLLER] ERRO GRAVE na transação de updateSettings:", error);
      return response.status(500).json({ error: 'Erro interno do servidor ao salvar as configurações.' });
    }
  },
  
  async resetOSCounter(request, response) {
    const { tipo: prefixo } = request.body; 
    if (!prefixo) {
      return response.status(400).json({ error: "O prefixo do contador é obrigatório." });
    }
    try {
      const settings = await connection('configuracoes')
        .whereIn('chave', ['os_prefixo_chamado', 'os_prefixo_servico'])
        .select('chave', 'valor');
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.chave] = setting.valor;
        return acc;
      }, {});
      let tipoOSParaZerar = null;
      if (settingsMap.os_prefixo_chamado === prefixo) {
        tipoOSParaZerar = 'CHAMADO';
      } else if (settingsMap.os_prefixo_servico === prefixo) {
        tipoOSParaZerar = 'SERVICO';
      }
      if (!tipoOSParaZerar) {
        return response.status(404).json({ error: `Nenhum tipo de OS encontrado para o prefixo '${prefixo}'.` });
      }
      await connection('contadores_os').where('tipo', tipoOSParaZerar).del();
      return response.status(200).json({ message: `Contador para o tipo '${tipoOSParaZerar}' (prefixo '${prefixo}') foi zerado com sucesso.` });
    } catch (error) {
      console.error(`Erro ao zerar o contador para o prefixo ${prefixo}:`, error);
      return response.status(500).json({ error: 'Erro interno ao zerar o contador.' });
    }
  }
};