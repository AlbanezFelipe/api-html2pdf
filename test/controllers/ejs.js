const ejs = require("ejs")
const path = require('path')
const utils = require('../../commons/utils')

const TEMPLATES_DIR = path.join(process.cwd(), 'views')

const renderEjs = async (templateName, data) => {
  return await ejs.renderFile(path.join(TEMPLATES_DIR, `${templateName}.ejs`), { ...data, utils }, {
    cache: true,
    rmWhitespace: false,
    filename: path.join(TEMPLATES_DIR, `${templateName}.ejs`)
  });
}

exports.rabruneFaturamento = async (req, res, next) => {
  res.send(await renderEjs('rabrune/faturamento', {
    cabecalho_emp: {
      NOME_EMP: 'RABRUNE AUTO PECAS LTDA',
      ENDERECO_EMP: 'AVENIDA AMELIA BERNARDINI CUTRALE',
      NUMERO_EMP: '2962',
      BAIRRO_EMP: 'Residencial San Conrado',
      CIDADE_EMP: 'BEBEDOURO',
      ESTADO_EMP: 'SP',
      CEP_PEMP: '14701-550',
      TELEFONE_EMP: '(17) 3345-9090',
      DATA_RELATORIO: '2026-01-27T09:24:21.800'
    },
    cabecalho: {
      CLIENTE: '3404 - ADMIR MOREIRA CASTRO NETO',
      ENDERECO: 'RUA MARIO NOGUEIRA DA SILVA',
      NUMERO: '58',
      CEP: '14706-140',
      BAIRRO: 'PARQUE RESIDENCIAL ELDORA',
      CIDADE: 'BEBEDOURO',
      ESTADO: 'SP',
      TELEFONE: '(17) 3342-1105',
      COMPLEMENTO: ''
    },
    pedidos: [
      {
        PEDIDO: 2848541,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-16',
        VALOR: 8.88,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848545,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-16',
        VALOR: 5.66,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848562,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-19',
        VALOR: 7.8,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848563,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-19',
        VALOR: 6.8,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848564,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-19',
        VALOR: 5.8,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848546,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-16',
        VALOR: 11.62,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848547,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-16',
        VALOR: 5.8,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848550,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-16',
        VALOR: 10,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848551,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-16',
        VALOR: 10,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848561,
        ESPECIE: 'Troca                                             ',
        DATA: '2026-01-19',
        VALOR: 132.2,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848575,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-21',
        VALOR: 7.8,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848577,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-21',
        VALOR: 134.96,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848593,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-23',
        VALOR: 6,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848594,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-23',
        VALOR: 6,
        OBSERVACOES: '',
        EMPRESA: 1
      },
      {
        PEDIDO: 2848596,
        ESPECIE: 'Venda                                             ',
        DATA: '2026-01-23',
        VALOR: 50,
        OBSERVACOES: '',
        EMPRESA: 1
      }
    ],
    totais: {
      VALOR_VENDAS: 409.32,
      TOTAL_VENDAS: 15,
      CREDITO: 440.88,
      OUTRAS_DESPESAS: 0,
      VALOR_TOTAL: 850.2
    }
  }))
}