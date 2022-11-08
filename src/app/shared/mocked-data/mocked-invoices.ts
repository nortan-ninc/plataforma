import { externalMockedContractors } from './mocked-contractors';
import { externalMockedSectors } from './mocked-sectors';
import { externalMockedTeams } from './mocked-teams';
import { externalMockedUsers } from './mocked-users';

import { Invoice } from '@models/invoice';

export const externalMockedInvoices: Invoice[] = [
  {
    _id: '0',
    administration: 'nortan',
    author: externalMockedUsers[0],
    code: 'ORC-84/2021-NRT/DAD-00',
    contractor: externalMockedContractors[0],
    created: new Date(),
    discount: '0,00',
    importants: [],
    invoiceType: 'projeto',
    laec: [],
    laee: [],
    laep: [],
    lastUpdate: new Date(),
    materialListType: '1',
    materials: [],
    description: 'InvoiceTest',
    nortanTeam: '6201b405329f446f16e1b404',
    productListType: '2',
    products: [],
    prospectedBy: externalMockedUsers[0],
    sector: externalMockedSectors[0],
    service: 'Teste',
    stages: [],
    status: 'Teste',
    statusHistory: [],
    type: 'projeto',
    value: '1.000,00',
    team: [
      {
        user: externalMockedUsers[0],
        sector: externalMockedSectors[0],
        distribution: '60,00',
        locals: {
          grossValue: '480,00',
          netValue: '480,00',
        },
      },
      {
        user: externalMockedUsers[1],
        sector: externalMockedSectors[1],
        distribution: '40,00',
        locals: {
          grossValue: '320,00',
          netValue: '320,00',
        },
      },
    ],
    hasPageBreak: {
      valuesTable: false,
      stagesTable: false,
      materialTable: false,
      preliminaryStage: false,
      executiveStage: false,
      complementaryStage: false,
      importants: false,
      contractor: false,
      subject: false,
    },
    providers: [],
    locals: {
      isModel: false,
      contractorName: '',
      name: '',
      role: 'Nenhum',
    },
  },
  {
    _id: '1',
    administration: 'pessoal',
    author: externalMockedUsers[1],
    code: 'ORC-2/2021-NRT/DEC-00',
    contractor: externalMockedContractors[0],
    created: new Date(),
    discount: '0,00',
    importants: [],
    invoiceType: 'projeto',
    laec: [],
    laee: [],
    laep: [],
    lastUpdate: new Date(),
    materialListType: '1',
    materials: [],
    description: 'InvoiceTest',
    nortanTeam: externalMockedTeams[0],
    productListType: '2',
    products: [],
    prospectedBy: externalMockedUsers[0],
    sector: externalMockedSectors[1],
    service: 'Teste',
    stages: [],
    status: 'Teste',
    statusHistory: [],
    type: 'projeto',
    value: '2.000,00',
    team: [
      {
        user: externalMockedUsers[1],
        sector: externalMockedSectors[0],
        distribution: '60,00',
        locals: {
          grossValue: '1.176,00',
          netValue: '976,08',
        },
      },
      {
        user: externalMockedUsers[0],
        sector: externalMockedSectors[1],
        distribution: '40,00',
        locals: {
          grossValue: '784,00',
          netValue: '650,72',
        },
      },
    ],
    hasPageBreak: {
      valuesTable: false,
      stagesTable: false,
      materialTable: false,
      preliminaryStage: false,
      executiveStage: false,
      complementaryStage: false,
      importants: false,
      contractor: false,
      subject: false,
    },
    providers: [],
    locals: {
      isModel: false,
      contractorName: '',
      name: '',
      role: 'Nenhum',
    },
  },
  {
    _id: '2',
    administration: 'pessoal',
    author: externalMockedUsers[1],
    code: 'ORC-2/2021-NRT/DEC-00',
    contractor: externalMockedContractors[0],
    created: new Date(),
    discount: '0,00',
    importants: [],
    invoiceType: 'projeto',
    laec: [],
    laee: [],
    laep: [],
    lastUpdate: new Date(),
    materialListType: '1',
    materials: [],
    description: 'InvoiceTest para OE',
    nortanTeam: externalMockedTeams[0],
    productListType: '2',
    products: [],
    prospectedBy: externalMockedUsers[0],
    sector: externalMockedSectors[1],
    service: 'Teste',
    stages: [],
    status: 'Teste',
    statusHistory: [],
    type: 'projeto',
    value: '2.000,00',
    team: [
      {
        user: externalMockedUsers[1],
        sector: externalMockedSectors[0],
        distribution: '60,00',
        locals: {
          grossValue: '1.176,00',
          netValue: '976,08',
        },
      },
      {
        user: externalMockedUsers[0],
        sector: externalMockedSectors[1],
        distribution: '40,00',
        locals: {
          grossValue: '784,00',
          netValue: '650,72',
        },
      },
    ],
    hasPageBreak: {
      valuesTable: false,
      stagesTable: false,
      materialTable: false,
      preliminaryStage: false,
      executiveStage: false,
      complementaryStage: false,
      importants: false,
      contractor: false,
      subject: false,
    },
    providers: [],
    locals: {
      isModel: false,
      contractorName: '',
      name: '',
      role: 'Nenhum',
    },
  },
];
