// services/operationalDataService.ts

/**
 * Este arquivo simula a busca de dados de um sistema de apontamento externo,
 * onde os operadores registram o tempo de operação real das máquinas.
 * Em um cenário real, isso seria uma chamada de API para esse outro sistema.
 */

export interface EquipmentOperationalData {
  totalOperationalTimeMs: number;
}

// Chave: nome do equipamento, Valor: dados operacionais
const MOCK_OPERATIONAL_DATA: Record<string, EquipmentOperationalData> = {
  'Prensa PH-02': {
    // Simulando 500 horas de operação
    totalOperationalTimeMs: 500 * 60 * 60 * 1000, 
  },
  'Rosqueadeira R-05': {
     // Simulando 1200 horas de operação
    totalOperationalTimeMs: 1200 * 60 * 60 * 1000,
  },
  'PC-EXP-01': {
    // Simulando 2500 horas de operação
    totalOperationalTimeMs: 2500 * 60 * 60 * 1000,
  },
  'Iluminação Galpão Prensas': {
    // Simulando 8000 horas de operação
    totalOperationalTimeMs: 8000 * 60 * 60 * 1000,
  },
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Simula a busca de todos os dados operacionais de equipamentos.
 * @returns Uma promessa que resolve com o registro de dados operacionais.
 */
export const getOperationalData = async (): Promise<Record<string, EquipmentOperationalData>> => {
  await delay(400); // Simula latência de rede diferente
  return JSON.parse(JSON.stringify(MOCK_OPERATIONAL_DATA));
};
