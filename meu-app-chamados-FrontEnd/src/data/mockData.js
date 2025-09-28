// src/data/mockData.js

// SERVIÇOS AGENDADOS: Atribuídos diretamente a um técnico.
export const servicosIniciais = [
  { 
    id: 'OS-SERV-201', 
    ic: 'SHOP-MR-01',
    cliente: 'Shopping Miramar', 
    status: 'Atribuído', 
    tipoServico: 'Manutenção Preventiva',
    descricao: 'Executar a manutenção preventiva mensal do elevador panorâmico principal, conforme checklist.',
    endereco: 'Av. Epitácio Pessoa, 4500, Miramar'
  },
];

// CHAMADOS URGENTES: Vão para uma fila geral.
export const chamadosUrgentesIniciais = [
  { 
    id: 'OS-URG-101', 
    ic: 'ED-ATL-01',
    cliente: 'Edifício Atlântico', 
    status: 'Aguardando Técnico', 
    prioridade: 0,
    tipoServico: 'URGENTE: Cliente Preso',
    descricao: 'Elevador social parado entre os andares 5 e 6 com passageiros presos.',
    endereco: 'Av. Atlântica, 1200, Cabo Branco'
  },
  { 
    id: 'OS-URG-102', 
    ic: 'COND-SN-05',
    cliente: 'Condomínio Sol Nascente', 
    status: 'Aguardando Técnico', 
    prioridade: 1,
    tipoServico: 'Parado',
    descricao: 'Porta do elevador de serviço não fecha completamente, mantendo-o inoperante.',
    endereco: 'Rua dos Girassóis, 350, Bessa'
  },
];

export const estoqueInicialDoTecnico = [
    { id: 'elev-01', nome: 'Sensor de Porta Infravermelho', quantidade: 4 },
    { id: 'elev-02', nome: 'Placa Controladora Logic-A2', quantidade: 2 },
    { id: 'elev-03', nome: 'Cabo de Aço 10mm (metro)', quantidade: 20 },
];

export const ITENS_APR = [
    { id: 'energia', texto: 'A energia do elevador está desligada e devidamente bloqueada/etiquetada?' },
    { id: 'poco', texto: 'A área do poço do elevador está sinalizada e segura para acesso?' },
    { id: 'comunicacao', texto: 'A comunicação com a central (interfone) está funcional?' },
];

// ==============================================================================
// CORREÇÃO: Os IDs dos técnicos agora são NÚMEROS, iguais aos do banco de dados.
// ==============================================================================
export const tecnicosDisponiveis = [
  { id: 1, nome: 'João Silva', chamadosAtivos: 2 },
  { id: 2, nome: 'Ana Costa', chamadosAtivos: 0 }, // Assumindo que o Operador também pode ser selecionado para testes
  { id: 3, nome: 'Carlos Pereira', chamadosAtivos: 1 }, // Assumindo que o Gestor também pode ser selecionado para testes
];
