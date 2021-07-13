import { TestBed } from '@angular/core/testing';

import {
  ContractService,
  CONTRACT_STATOOS,
  EXPENSE_TYPES,
  SPLIT_TYPES,
} from './contract.service';
import { CommonTestingModule } from 'app/../common-testing.module';
import {
  Contract,
  ContractReceipt,
  ContractExpense,
  ContractPayment,
} from '@models/contract';
import { HttpTestingController } from '@angular/common/http/testing';
import { User } from '@models/user';
import { Invoice } from '@models/invoice';
import { Subject } from 'rxjs';
import { SocketMock } from 'types/socketio-mock';
import { AuthService } from 'app/auth/auth.service';
import { Socket } from 'ngx-socket-io';
import { CONTRACT_BALANCE } from './user.service';
import MockedServerSocket from 'socket.io-mock';
import { cloneDeep } from 'lodash';
import { take } from 'rxjs/operators';
import { parseISO } from 'date-fns';

describe('ContractService', () => {
  let service: ContractService;
  let httpMock: HttpTestingController;
  let mockedUsers: User[];
  let mockedInvoices: Invoice[];
  let mockedContracts: Contract[];
  const socket$ = new Subject<any>();
  const socket: SocketMock = new MockedServerSocket();
  const authServiceSpy = jasmine.createSpyObj<AuthService>(
    'AuthService',
    ['userEmail'],
    { onUserChange$: new Subject<void>() }
  );
  const socketServiceSpy = jasmine.createSpyObj<Socket>('Socket', [
    'fromEvent',
  ]);

  CommonTestingModule.setUpTestBed();

  const baseTest = (
    name: string,
    test: (expectedContracts: Contract[]) => void
  ) => {
    it(name, (done: DoneFn) => {
      let i = 1;

      service
        .getContracts()
        .pipe(take(2))
        .subscribe((contracts) => {
          switch (i) {
            case 1: {
              i += 1;
              expect(contracts.length).toBe(0);
              break;
            }
            case 2: {
              i += 1;
              const expectedContracts = JSON.parse(
                JSON.stringify(mockedContracts),
                (k, v) => {
                  if (['created', 'lastUpdate', 'paidDate'].includes(k))
                    return parseISO(v);
                  return v;
                }
              ) as Contract[];
              expect(contracts.length).toBe(2);
              expect(contracts).toEqual(expectedContracts);
              test(expectedContracts);
              done();
              break;
            }
            default: {
              break;
            }
          }
        });
      // mock response
      const req = httpMock.expectOne('/api/contract/all');
      expect(req.request.method).toBe('POST');
      setTimeout(() => {
        req.flush(mockedContracts);
      }, 50);
    });
  };

  beforeEach(() => {
    TestBed.overrideProvider(AuthService, { useValue: authServiceSpy });
    TestBed.overrideProvider(Socket, { useValue: socketServiceSpy });
    authServiceSpy.userEmail.and.returnValue('test1@te.st');
    socketServiceSpy.fromEvent.and.returnValue(socket$);
    service = TestBed.inject(ContractService);
    httpMock = TestBed.inject(HttpTestingController);
    mockedUsers = [];
    mockedInvoices = [];
    mockedContracts = [];
    const tmpUser = new User();
    tmpUser._id = '0';
    tmpUser.fullName = 'Test1';
    tmpUser.email = 'test1@te.st';
    tmpUser.phone = '123456';
    mockedUsers.push(cloneDeep(tmpUser));
    tmpUser._id = '1';
    tmpUser.fullName = 'Test2';
    tmpUser.email = 'test2@te.st';
    tmpUser.phone = '123456';
    mockedUsers.push(cloneDeep(tmpUser));
    let tmpInvoice = new Invoice();
    tmpInvoice._id = '0';
    tmpInvoice.author = mockedUsers[0];
    tmpInvoice.department = 'DPC';
    tmpInvoice.coordination = 'test';
    tmpInvoice.code = 'ORC-1/2021-NRT/DPC-00';
    tmpInvoice.contractor = '0';
    tmpInvoice.trello = true;
    tmpInvoice.team.push({ user: '1', coordination: 'test' });
    mockedInvoices.push(cloneDeep(tmpInvoice));
    tmpInvoice = new Invoice();
    tmpInvoice._id = '1';
    tmpInvoice.author = mockedUsers[1];
    tmpInvoice.department = 'DEC';
    tmpInvoice.coordination = 'test';
    tmpInvoice.code = 'ORC-2/2021-NRT/DEC-00';
    tmpInvoice.contractor = '0';
    tmpInvoice.trello = false;
    tmpInvoice.team.push({ user: '0', coordination: 'test' });
    mockedInvoices.push(cloneDeep(tmpInvoice));
    let tmpContract = new Contract();
    tmpContract._id = '0';
    tmpContract.invoice = mockedInvoices[0];
    tmpContract.liquid = '1.000,00';
    tmpContract.balance = '1.000,00';
    tmpContract.notPaid = '1.000,00';
    tmpContract.receipts.push(new ContractReceipt());
    let tmpExpense = new ContractExpense();
    tmpExpense.author = mockedUsers[0];
    tmpExpense.source = mockedUsers[0];
    tmpExpense.description = 'test';
    tmpExpense.nf = false;
    tmpExpense.type = EXPENSE_TYPES.APORTE;
    tmpExpense.splitType = SPLIT_TYPES.INDIVIDUAL;
    tmpExpense.value = '1.000,00';
    tmpExpense.paid = true;
    tmpExpense.code = '#0';
    tmpExpense.paidDate = new Date();
    tmpExpense.team.push({
      user: mockedUsers[0],
      value: '1.000,00',
      percentage: '100,00',
      coordination: 'test',
    });
    tmpContract.expenses.push(tmpExpense);
    tmpExpense = new ContractExpense();
    tmpExpense.author = mockedUsers[1];
    tmpExpense.source = mockedUsers[1];
    tmpExpense.description = 'test';
    tmpExpense.nf = false;
    tmpExpense.type = EXPENSE_TYPES.COMISSAO;
    tmpExpense.splitType = SPLIT_TYPES.PERSONALIZADO;
    tmpExpense.value = '200,00';
    tmpExpense.paid = true;
    tmpExpense.code = '#0';
    tmpExpense.paidDate = new Date();
    tmpExpense.team.push({
      user: mockedUsers[0],
      value: '120,00',
      percentage: '60,00',
      coordination: 'test',
    });
    tmpExpense.team.push({
      user: mockedUsers[1],
      value: '80,00',
      percentage: '40,00',
      coordination: 'test',
    });
    tmpContract.expenses.push(tmpExpense);
    tmpContract.expenses.push(new ContractExpense());
    mockedContracts.push(tmpContract);
    tmpContract = new Contract();
    tmpContract._id = '1';
    tmpContract.liquid = '2000,00';
    tmpContract.balance = '0,00';
    tmpContract.notPaid = '1000,00';
    tmpContract.invoice = mockedInvoices[1];
    let tmpPayment = new ContractPayment();
    tmpPayment.service = 'test';
    tmpPayment.value = '500,00';
    tmpPayment.paid = true;
    tmpPayment.paidDate = new Date();
    tmpPayment.team.push({
      user: mockedUsers[0],
      coordination: 'test',
      value: '500,00',
      percentage: '100,00',
    });
    tmpContract.payments.push(tmpPayment);
    tmpPayment = new ContractPayment();
    tmpPayment.service = 'test';
    tmpPayment.value = '500,00';
    tmpPayment.paid = true;
    tmpPayment.paidDate = new Date();
    tmpPayment.team.push({
      user: mockedUsers[0],
      coordination: 'test',
      value: '250,00',
      percentage: '50,00',
    });
    tmpPayment.team.push({
      user: mockedUsers[1],
      coordination: 'test',
      value: '250,00',
      percentage: '50,00',
    });
    tmpContract.payments.push(tmpPayment);
    tmpContract.payments.push(new ContractPayment());
    mockedContracts.push(tmpContract);
    // mock response
    const req = httpMock.expectOne('/api/user/all');
    expect(req.request.method).toBe('POST');
    req.flush(mockedUsers);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveContract should work', (done: DoneFn) => {
    const baseInvoice = new Invoice();
    baseInvoice._id = '2';
    baseInvoice.author = mockedUsers[0];
    baseInvoice.department = 'DPC';
    baseInvoice.coordination = 'test';
    baseInvoice.code = 'ORC-3/2021-NRT/DPC-00';
    baseInvoice.contractor = '0';
    mockedInvoices.push(baseInvoice);
    const tmpContract = new Contract();
    tmpContract._id = '2';
    tmpContract.invoice = mockedInvoices[2];
    tmpContract.status = CONTRACT_STATOOS.EM_ANDAMENTO;
    let i = 1;
    const data = {
      ns: {
        coll: 'contracts',
      },
      operationType: 'insert',
      fullDocument: tmpContract,
    };
    socket.socketClient.on('dbchange', (data: any) => socket$.next(data));

    service
      .getContracts()
      .pipe(take(3))
      .subscribe((contracts) => {
        switch (i) {
          case 1: {
            i += 1;
            expect(contracts.length).toBe(0);
            break;
          }
          case 2: {
            i += 1;
            expect(contracts.length).toBe(2);
            expect(contracts).toEqual(
              JSON.parse(JSON.stringify(mockedContracts), (k, v) => {
                if (['created', 'lastUpdate', 'paidDate'].includes(k))
                  return parseISO(v);
                return v;
              }) as Contract[]
            );
            service.saveContract(mockedInvoices[2]);
            const req1 = httpMock.expectOne('/api/contract/');
            expect(req1.request.method).toBe('POST');
            req1.flush({ contract: tmpContract });
            const req2 = httpMock.expectOne(
              'https://graph.microsoft.com/v1.0/drive/root:/04-DPC/01-Em Andamento/ORC-000_ANO-NOME DO CONTRATO-GESTOR'
            );
            expect(req2.request.method).toBe('GET');
            req2.flush({ parentReference: { driveId: '0', id: '0' }, id: '0' });
            socket.emit('dbchange', data);
            break;
          }
          case 3: {
            expect(contracts.length).toBe(3);
            mockedContracts.push(tmpContract);
            expect(contracts).toEqual(
              JSON.parse(JSON.stringify(mockedContracts), (k, v) => {
                if (['created', 'lastUpdate', 'paidDate'].includes(k))
                  return parseISO(v);
                return v;
              }) as Contract[]
            );
            const req3 = httpMock.expectOne(
              'https://graph.microsoft.com/v1.0/drive/items/0/copy'
            );
            expect(req3.request.method).toBe('POST');
            req3.flush(null);
            done();
            break;
          }
          default: {
            break;
          }
        }
      });
    // mock response
    const req = httpMock.expectOne('/api/contract/all');
    expect(req.request.method).toBe('POST');
    setTimeout(() => {
      req.flush(mockedContracts);
    }, 50);
  });

  it('editContract should work', (done: DoneFn) => {
    const tmpContract = cloneDeep(mockedContracts[1]);
    tmpContract.status = CONTRACT_STATOOS.A_RECEBER;
    let i = 1;
    const data = {
      ns: {
        coll: 'contracts',
      },
      operationType: 'update',
      documentKey: {
        _id: '1',
      },
      updateDescription: {
        updatedFields: { status: CONTRACT_STATOOS.A_RECEBER },
        removedFields: [] as any[],
      },
    };
    socket.socketClient.on('dbchange', (data: any) => socket$.next(data));

    service
      .getContracts()
      .pipe(take(3))
      .subscribe((contracts) => {
        switch (i) {
          case 1: {
            i += 1;
            expect(contracts.length).toBe(0);
            break;
          }
          case 2: {
            i += 1;
            expect(contracts.length).toBe(2);
            expect(contracts).toEqual(
              JSON.parse(JSON.stringify(mockedContracts), (k, v) => {
                if (['created', 'lastUpdate', 'paidDate'].includes(k))
                  return parseISO(v);
                return v;
              }) as Contract[]
            );
            service.editContract(tmpContract);
            const req1 = httpMock.expectOne('/api/contract/update');
            expect(req1.request.method).toBe('POST');
            req1.flush(null);
            socket.emit('dbchange', data);
            break;
          }
          case 3: {
            expect(contracts.length).toBe(2);
            expect(contracts[1].status).toBe(CONTRACT_STATOOS.A_RECEBER);
            done();
            break;
          }
          default: {
            break;
          }
        }
      });
    // mock response
    const req = httpMock.expectOne('/api/contract/all');
    expect(req.request.method).toBe('POST');
    setTimeout(() => {
      req.flush(mockedContracts);
    }, 50);
  });

  baseTest('getContracts should work', (expectedContracts: Contract[]) => {});

  it('contractsSize should work', (done: DoneFn) => {
    let i = 1;

    service
      .contractsSize()
      .pipe(take(2))
      .subscribe((size) => {
        switch (i) {
          case 1: {
            i += 1;
            expect(size).toBe(0);
            break;
          }
          case 2: {
            i += 1;
            expect(size).toBe(mockedContracts.length + 1);
            done();
            break;
          }
          default: {
            break;
          }
        }
      });
    // mock response
    const req = httpMock.expectOne('/api/contract/count');
    expect(req.request.method).toBe('POST');
    setTimeout(() => {
      req.flush({ size: mockedContracts.length });
    }, 50);
  });

  baseTest('idToContract should work', (expectedContracts: Contract[]) => {
    expect(service.idToContract('0')).toEqual(expectedContracts[0]);
    expect(service.idToContract(expectedContracts[0])).toEqual(
      expectedContracts[0]
    );
    expect(service.idToContract('1')).toEqual(expectedContracts[1]);
    expect(service.idToContract(expectedContracts[1])).toEqual(
      expectedContracts[1]
    );
  });

  baseTest('hasReceipts should work', (expectedContracts: Contract[]) => {
    expect(service.hasReceipts('0')).toBe(true);
    expect(service.hasReceipts(expectedContracts[0])).toBe(true);
    expect(service.hasReceipts('1')).toBe(false);
    expect(service.hasReceipts(expectedContracts[1])).toBe(false);
  });

  baseTest('hasPayments should work', (expectedContracts: Contract[]) => {
    expect(service.hasPayments('0')).toBe(false);
    expect(service.hasPayments(expectedContracts[0])).toBe(false);
    expect(service.hasPayments('1')).toBe(true);
    expect(service.hasPayments(expectedContracts[1])).toBe(true);
  });

  baseTest('hasExpenses should work', (expectedContracts: Contract[]) => {
    expect(service.hasExpenses('0')).toBe(true);
    expect(service.hasExpenses(expectedContracts[0])).toBe(true);
    expect(service.hasExpenses('1')).toBe(false);
    expect(service.hasExpenses(expectedContracts[1])).toBe(false);
  });

  it('netValueBalance should work', () => {
    expect(
      service.netValueBalance('60,00', mockedContracts[0], mockedUsers[0])
    ).toBe('1.480,00');
    expect(service.netValueBalance('40,00', mockedContracts[0], '1')).toBe(
      '520,00'
    );
    expect(service.netValueBalance('60,00', mockedContracts[1], '0')).toBe(
      '1.200,00'
    );
    expect(
      service.netValueBalance('40,00', mockedContracts[1], mockedUsers[1])
    ).toBe('800,00');
  });

  it('percentageToReceive should work', () => {
    expect(
      service.percentageToReceive('60,00', mockedUsers[0], mockedContracts[0])
    ).toBe('74,00');
    expect(service.percentageToReceive('40,00', '1', mockedContracts[0])).toBe(
      '26,00'
    );
    expect(service.percentageToReceive('60,00', '0', mockedContracts[1])).toBe(
      '45,00'
    );
    expect(
      service.percentageToReceive('40,00', mockedUsers[1], mockedContracts[1])
    ).toBe('55,00');
  });

  it('receivedValue should work', () => {
    expect(service.receivedValue(mockedUsers[0], mockedContracts[0])).toBe(
      '0,00'
    );
    expect(service.receivedValue('1', mockedContracts[0])).toBe('0,00');
    expect(service.receivedValue('0', mockedContracts[1])).toBe('750,00');
    expect(service.receivedValue(mockedUsers[1], mockedContracts[1])).toBe(
      '250,00'
    );
  });

  it('notPaidValue should work', () => {
    expect(
      service.notPaidValue('60,00', mockedUsers[0], mockedContracts[0])
    ).toBe('1.480,00');
    expect(service.notPaidValue('40,00', '1', mockedContracts[0])).toBe(
      '520,00'
    );
    expect(service.notPaidValue('60,00', '0', mockedContracts[1])).toBe(
      '450,00'
    );
    expect(
      service.notPaidValue('40,00', mockedUsers[1], mockedContracts[1])
    ).toBe('550,00');
  });

  it('toGrossValue should work', () => {
    expect(service.toGrossValue('100,00', '0', '0')).toBe('100,00');
    expect(service.toGrossValue('1.000,00', '0,00', '0,00')).toBe('1.000,00');
    expect(service.toGrossValue('100.000,00', '8,5', '15,00')).toBe(
      '128.576,02'
    );
    expect(service.toGrossValue('1.000.000,00', '15,5', '17,00')).toBe(
      '1.425.821,63'
    );
  });

  it('toNetValue should work', () => {
    expect(service.toNetValue('100,00', '0', '0')).toBe('100,00');
    expect(service.toNetValue('1.000,00', '0,00', '0,00')).toBe('1.000,00');
    expect(service.toNetValue('128.576,02', '8,5', '15,00')).toBe('100.000,00');
    expect(service.toNetValue('1.425.821,63', '15,5', '17,00')).toBe(
      '1.000.000,00'
    );
  });

  it('subtractComissions should work', () => {
    expect(service.subtractComissions('1.000,00', mockedContracts[0])).toBe(
      '800,00'
    );
    expect(service.subtractComissions('2.000,00', mockedContracts[1])).toBe(
      '2.000,00'
    );
  });
});
