import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { isAfter, isBefore } from 'date-fns';
import { cloneDeep, isEqualWith } from 'lodash';
import { BehaviorSubject, combineLatest, Observable, skipWhile, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

import {
  applyPercentage,
  moneyToNumber,
  numberToMoney,
  removePercentage,
  revertPercentage,
  round,
  subtractMoney,
  sumMoney,
  toMultiplyPercentage,
  toPercentage,
} from '../string-utils';
import {
  handle,
  idToProperty,
  isOfType,
  isWithinInterval,
  nfPercentage,
  nortanPercentage,
  omitDeep,
  reviveDates,
} from '../utils';
import { ConfigService, EXPENSE_TYPES } from './config.service';
import { ContractorService } from './contractor.service';
import { InvoiceService } from './invoice.service';
import { OneDriveService } from './onedrive.service';
import { CLIENT, CONTRACT_BALANCE, UserService } from './user.service';
import { WebSocketService } from './web-socket.service';

import { StatusHistoryItem } from '@models/baseStatusHistory';
import {
  ChecklistItemAction,
  Contract,
  ContractExpense,
  ContractLocals,
  ContractPayment,
  ContractReceipt,
} from '@models/contract';
import { Invoice } from '@models/invoice';
import { PlatformConfig } from '@models/platformConfig';
import { User } from '@models/user';

export enum CONTRACT_TRANSACTION_TYPES {
  RECEIPTS = 'receipts',
  PAYMENTS = 'payments',
  EXPENSES = 'expenses',
}
export enum SPLIT_TYPES {
  INDIVIDUAL = 'Individual',
  PERSONALIZADO = 'Personalizado',
  PROPORCIONAL = 'Proporcional',
}

export enum CONTRACT_STATOOS {
  EM_ANDAMENTO = 'Em andamento',
  A_RECEBER = 'A receber',
  CONCLUIDO = 'Concluído',
  ARQUIVADO = 'Arquivado',
  ENTREGUE = 'Entregue',
}

export enum AVALIABLE_MANAGEMENT_STATUS {
  PRODUCAO = 'Produção',
  ANALISE_EXTERNA = 'Análise Externa',
  ESPERA = 'Espera',
  PRIORIDADE = 'Prioridade',
  FINALIZACAO = 'Finalização',
  CONCLUIDO = 'Concluído',
}

export enum AVALIABLE_MANAGEMENT_ITEM_STATUS {
  BRIEFING = 'Briefing',
  ANTEPROJETO = 'Anteprojeto',
  ESTUDO_PRELIMINAR = 'Estudo preliminar',
  PROJETO_BASICO = 'Projeto básico',
  PROJETO_EXECUTIVO = 'Projeto executivo',
  CAMPO = 'Campo',
  PRIORIDADE = 'Prioridade',
  ANALISE_EXTERNA = 'Análise externa',
  ESPERA = 'Espera',
  FINALIZACAO = 'Finalização',
  CONCLUIDO = 'Concluído',
}

export interface ExpenseParts {
  expense: number;
  contribution: number;
  cashback: number;
  comission: number;
}

export interface ExpenseTypesSum {
  type: string;
  value: string;
}

export interface ContractTransactionInfo {
  contract: Contract;
  value: string;
  payment?: ContractPayment;
  receipt?: ContractReceipt;
  expense?: ContractExpense;
  code: number;
}

@Injectable({
  providedIn: 'root',
})
export class ContractService implements OnDestroy {
  private requested = false;
  private size$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();
  private contracts$ = new BehaviorSubject<Contract[]>([]);
  private _isDataLoaded$ = new BehaviorSubject<boolean>(false);

  submittedToEdit$ = new Subject<void>();
  config: PlatformConfig = new PlatformConfig();

  get isDataLoaded$(): Observable<boolean> {
    return this._isDataLoaded$.asObservable();
  }

  constructor(
    private configService: ConfigService,
    private contractorService: ContractorService,
    private http: HttpClient,
    private invoiceService: InvoiceService,
    private onedrive: OneDriveService,
    private userService: UserService,
    private wsService: WebSocketService
  ) {
    combineLatest([this.configService.getConfig(), this.configService.isDataLoaded$])
      .pipe(
        takeUntil(this.destroy$),
        skipWhile(([_, isConfigDataLoaded]) => !isConfigDataLoaded)
      )
      .subscribe(([configs, _]) => (this.config = configs[0]));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveContract(invoice: Invoice, callback?: () => void): void {
    const contract = new Contract();
    contract.statusHistory.push({
      status: contract.status,
      start: contract.created,
    });
    contract.invoice = invoice;
    contract.total = invoice.stages.length.toString();
    const req = {
      contract: contract,
    };
    this.http
      .post('/api/contract/', req)
      .pipe(take(1))
      .subscribe(() => {
        this.onedrive.copyModelFolder(invoice);
        if (callback) callback();
      });
  }

  isEqual(c1: string | Contract | undefined, c2: string | Contract | undefined): boolean {
    if (c1 == undefined || c2 == undefined) return false;
    c1 = omitDeep(this.idToContract(c1), ['locals', 'statusHistory']);
    c2 = omitDeep(this.idToContract(c2), ['locals', 'statusHistory']);
    return isEqualWith(c1, c2, (value, other, key) => {
      if (key == 'invoice') {
        return this.invoiceService.isEqual(value, other);
      }
      return undefined;
    });
  }

  editContract(contract: Contract): void {
    contract.lastUpdate = new Date();
    const req = {
      contract: contract,
    };
    const history = cloneDeep(contract.statusHistory);
    const isMoved = history
      .splice(0, history.length - 1)
      .find((el: StatusHistoryItem) => el.status === CONTRACT_STATOOS.CONCLUIDO);
    this.http
      .post('/api/contract/update', req)
      .pipe(take(1))
      .subscribe(() => {
        if (contract.status === CONTRACT_STATOOS.CONCLUIDO && !isMoved && isOfType(Invoice, contract.invoice))
          this.onedrive.moveToConcluded(contract.invoice);
      });
    this.submittedToEdit$.next();
  }

  getContracts(): Observable<Contract[]> {
    if (!this.requested) {
      this.requested = true;
      this.http
        .post('/api/contract/all', {})
        .pipe(take(1))
        .subscribe((contracts: any) => {
          const tmp = reviveDates(contracts);
          this.contracts$.next(tmp as Contract[]);
          this._isDataLoaded$.next(true);
        });
      this.wsService
        .fromEvent('dbchange')
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          handle(data, this.contracts$, 'contracts');
        });
    }
    return this.contracts$;
  }

  idToContract(id: string | Contract): Contract {
    if (isOfType(Contract, id)) return id;
    const tmp = this.contracts$.getValue();
    return tmp[tmp.findIndex((el) => el._id === id)];
  }

  hasReceipts(cId: string | Contract): boolean {
    const contract = this.idToContract(cId);
    return contract.receipts.length != 0;
  }

  hasPayments(cId: string | Contract): boolean {
    const contract = this.idToContract(cId);
    return contract.payments.length != 0;
  }

  hasExpenses(cId: string | Contract): boolean {
    const contract = this.idToContract(cId);
    return contract.expenses.length != 0;
  }

  balance(contract: Contract, endDate: Date = new Date()): string {
    const paid = this.paidValue(contract, endDate);
    const expenseContribution = this.expensesContributions(contract, undefined, endDate);
    return numberToMoney(
      round(
        moneyToNumber(paid) -
          contract.payments
            .filter((payment) => payment.paidDate && !isAfter(payment.paidDate, endDate))
            .reduce((accumulator: number, payment: any) => {
              if (payment.paid) accumulator = accumulator + moneyToNumber(payment.value);
              return accumulator;
            }, 0) -
          expenseContribution.global.expense +
          expenseContribution.global.contribution +
          expenseContribution.global.cashback
      )
    );
  }

  netValueBalance(distribution: string, contract: Contract, user: User | string | undefined): string {
    if (distribution == undefined) return '0,00';
    const expenseContribution = contract.expenses
      .filter(
        (expense) =>
          expense.paid &&
          expense.source &&
          this.userService.idToUser(expense.source)._id != CLIENT._id &&
          expense.type != EXPENSE_TYPES.COMISSAO
      )
      .reduce(
        (sum, expense) => {
          if (expense.type == EXPENSE_TYPES.APORTE) {
            if (this.userService.isEqual(expense.source, user)) sum.contribution += moneyToNumber(expense.value);
          } else {
            if (this.userService.isEqual(expense.source, user)) sum.expense += moneyToNumber(expense.value);
            for (const member of expense.team) {
              if (this.userService.isEqual(member.user, user)) sum.contract += moneyToNumber(member.value);
            }
          }
          return sum;
        },
        { expense: 0, contribution: 0, contract: 0 }
      );
    const result = round(
      moneyToNumber(contract.locals.liquid) * toMultiplyPercentage(distribution) -
        expenseContribution.contract +
        expenseContribution.expense +
        expenseContribution.contribution
    );

    return numberToMoney(result);
  }

  /* eslint-disable indent */
  expensesContributions(
    contract: Contract,
    user?: User | string,
    endDate: Date = new Date()
  ): {
    user: ExpenseParts;
    global: ExpenseParts;
  } {
    /* eslint-enable @typescript-eslint/indent */
    return contract.expenses
      .filter(
        (expense) =>
          expense.paidDate &&
          expense.source &&
          this.userService.idToUser(expense.source)._id != CLIENT._id &&
          !isAfter(expense.paidDate, endDate)
      )
      .reduce(
        (accumulator, expense: ContractExpense) => {
          if (expense.source && this.userService.idToUser(expense.source)._id == CONTRACT_BALANCE._id) {
            const expenseValue = moneyToNumber(expense.value);
            const member = expense.team.find((el) => {
              return this.userService.isEqual(el.user, user);
            });

            if (expense.type == EXPENSE_TYPES.COMISSAO) {
              accumulator.global.comission += moneyToNumber(expense.value);
            }
            if (member && expense.type != EXPENSE_TYPES.COMISSAO) {
              accumulator.user.expense += moneyToNumber(member.value);
            }
            accumulator.global.expense += expenseValue;
          }

          if (expense.type == EXPENSE_TYPES.APORTE) {
            const contributionValue = moneyToNumber(expense.value);
            if (this.userService.isEqual(expense.author, user)) {
              accumulator.user.contribution += contributionValue;
            }
            accumulator.global.contribution += contributionValue;
          }
          return accumulator;
        },
        {
          user: { expense: 0, contribution: 0, cashback: 0, comission: 0 },
          global: { expense: 0, contribution: 0, cashback: 0, comission: 0 },
        }
      );
  }

  percentageToReceive(distribution: string, user: User | string | undefined, contract: Contract, decimals = 2): string {
    let sum = numberToMoney(
      moneyToNumber(
        this.toNetValue(
          this.subtractComissions(
            removePercentage(
              idToProperty(contract.invoice, this.invoiceService.idToInvoice.bind(this.invoiceService), 'value'),
              contract.ISS
            ),
            contract
          ),
          nfPercentage(contract, this.config.invoiceConfig),
          nortanPercentage(contract, this.config.invoiceConfig),
          contract.created
        )
      ) + this.getComissionsSum(contract)
    );
    sum = sumMoney(subtractMoney(sum, this.paidValue(contract)), contract.locals.balance);
    return toPercentage(this.notPaidValue(distribution, user, contract), sum, decimals).slice(0, -1);
  }

  receivedValue(user: User | string | undefined, contract: Contract, start?: Date, end?: Date): string {
    let validPayments = contract.payments;

    if (start && end) {
      validPayments = contract.payments.filter(
        (payment) => payment.paidDate && isWithinInterval(payment.paidDate, start, end)
      );
    }

    const received = validPayments
      .filter((payment) => payment.paid)
      .map((payment) => payment.team)
      .flat()
      .reduce((sum, member) => {
        if (this.userService.isEqual(member.user, user)) sum += moneyToNumber(member.value);
        return sum;
      }, 0);

    return numberToMoney(received);
  }

  paidValue(contract: Contract, endDate: Date = new Date(), isNet = true): string {
    const totalPaidValue = contract.receipts
      .filter((receipt) => receipt.paidDate && !isAfter(receipt.paidDate, endDate))
      .reduce((total, receipt) => {
        if (!receipt.paid) return total;
        if (isNet) return sumMoney(this.receiptNetValue(receipt), total);
        else return sumMoney(receipt.value, total);
      }, '0,00');

    return totalPaidValue;
  }

  notPaidValue(distribution: string, user: User | string | undefined, contract: Contract): string {
    return numberToMoney(
      moneyToNumber(this.netValueBalance(distribution, contract, user)) -
        moneyToNumber(this.receivedValue(user, contract))
    );
  }

  toGrossValue(netValue: string, NF: string, nortanPercentage: string): string {
    return revertPercentage(revertPercentage(netValue, NF), nortanPercentage);
  }

  toNetValue(grossValue: string, NF: string, nortanPercentage: string, createdDate: Date): string {
    if (isBefore(createdDate, new Date('2022/08/15')))
      return removePercentage(removePercentage(grossValue, NF), nortanPercentage);
    return subtractMoney(
      subtractMoney(grossValue, applyPercentage(grossValue, NF)),
      applyPercentage(grossValue, nortanPercentage)
    );
  }

  subtractComissions(contractValue: string, contract: Contract): string {
    const comissionsSum = this.getComissionsSum(contract);

    return numberToMoney(moneyToNumber(contractValue) - comissionsSum);
  }

  getComissionsSum(contract: Contract): number {
    return this.expensesContributions(contract).global.comission;
  }

  getMemberExpensesSum(user: User | string | undefined, contract: Contract, start?: Date, end?: Date): string {
    let validExpenses = contract.expenses;

    if (start && end) {
      validExpenses = contract.expenses.filter(
        (expense) => expense.paidDate && isWithinInterval(expense.paidDate, start, end)
      );
    }

    const filteredExpenses = validExpenses
      .filter((expense) => {
        return (
          expense.paid &&
          expense.type !== EXPENSE_TYPES.APORTE &&
          expense.type !== EXPENSE_TYPES.COMISSAO &&
          !this.userService.isEqual(expense.source, CONTRACT_BALANCE) &&
          !this.userService.isEqual(expense.source, CLIENT)
        );
      })
      .map((expense) => expense.team)
      .flat();

    const expensesSum = filteredExpenses.reduce((sum, expense) => {
      if (this.userService.isEqual(expense.user, user)) {
        sum += moneyToNumber(expense.value);
      }
      return sum;
    }, 0);

    return numberToMoney(expensesSum);
  }

  getMemberBalance(user: User | string | undefined, contract: Contract): string {
    const receivedSum = this.receivedValue(user, contract);
    const expensesSum = this.getMemberExpensesSum(user, contract);
    return numberToMoney(moneyToNumber(receivedSum) - moneyToNumber(expensesSum));
  }

  checkEditPermission(invoice: Invoice): Observable<boolean> {
    return this.userService.currentUser$.pipe(
      map((user: User) => {
        if (invoice.team.length == 0) return true;
        return this.isUserAnAER(user, invoice) || this.userService.isEqual(user, invoice.team[0].user);
      })
    );
  }

  fillContract(contract: Contract): Contract {
    if (contract.invoice) {
      const invoice = this.invoiceService.idToInvoice(contract.invoice);
      contract.invoice = invoice;
      contract.locals = {} as ContractLocals;
      contract.locals.interests = contract.receipts.length.toString() + '/' + contract.total;
      this.userService.currentUser$.pipe(take(1)).subscribe((user) => {
        contract.locals.role = this.invoiceService.role(invoice, user);
      });

      contract.locals.balance = this.balance(contract);
      contract.locals.liquid = this.contractNetValue(contract);

      const nf = nfPercentage(contract, this.config.invoiceConfig);
      const nortan = nortanPercentage(contract, this.config.invoiceConfig);
      const paid = this.toNetValue(
        numberToMoney(
          contract.receipts.reduce((accumulator: number, recipt: any) => {
            if (recipt.paid) accumulator = accumulator + moneyToNumber(recipt.value);
            return accumulator;
          }, 0)
        ),
        nf,
        nortan,
        contract.created
      );

      contract.locals.notPaid = subtractMoney(this.toNetValue(invoice.value, nf, nortan, contract.created), paid);
    }
    return contract;
  }

  expenseTypesSum(wantsClient = false, contract: Contract): Observable<ExpenseTypesSum[]> {
    return combineLatest([this.configService.getConfig(), this.configService.isDataLoaded$]).pipe(
      skipWhile(([_, isLoaded]) => !isLoaded),
      map(([configs, _]) => {
        const result = contract.expenses.reduce(
          (sum: ExpenseTypesSum[], expense: ContractExpense) => {
            if (
              expense.source &&
              (wantsClient
                ? this.userService.isEqual(expense.source, CLIENT._id)
                : !this.userService.isEqual(expense.source, CLIENT._id))
            ) {
              const idx = sum.findIndex((el) => el.type == expense.type);
              sum[idx].value = sumMoney(sum[idx].value, expense.value);
            }
            return sum;
          },
          configs[0].expenseConfig.contractExpenseTypes.map((type) => ({
            type: type.name,
            value: '0,00',
          }))
        );
        const total = result.reduce((sum: string, expense: ExpenseTypesSum) => sumMoney(sum, expense.value), '0,00');
        result.push({ type: 'TOTAL', value: total });
        return result;
      })
    );
  }

  deadline(contract: Contract): Date | undefined {
    return contract.checklist.length != 0 ? this.latestEndDate(contract) : undefined;
  }

  actionsByContract(contract: Contract): ChecklistItemAction[] {
    return contract.checklist.map((item) => item.actionList).flat();
  }

  allActions(): ChecklistItemAction[] {
    return this.contracts$
      .getValue()
      .map((contract) => this.actionsByContract(contract))
      .flat();
  }

  isContractActive(contract: Contract): boolean {
    return contract.status == CONTRACT_STATOOS.EM_ANDAMENTO || contract.status == CONTRACT_STATOOS.A_RECEBER;
  }

  contractHasPaymentsWithUser(contract: Contract, userID: string) {
    return contract.payments.some((payment) =>
      payment.team.some((paymentTeamMember) => this.userService.isEqual(paymentTeamMember.user, userID))
    );
  }

  contractHasExpensesWithUser(contract: Contract, userID: string) {
    return contract.expenses.some((expense) =>
      expense.team.some((expenseTeamMember) => this.userService.isEqual(expenseTeamMember.user, userID))
    );
  }

  userContractsByStatus(userID: string, allowedStatuses: CONTRACT_STATOOS[]): Observable<Contract[]> {
    return combineLatest([this.contracts$, this.invoiceService.getInvoices(), this.invoiceService.isDataLoaded$]).pipe(
      skipWhile(([, , isInvoiceDataLoaded]) => !isInvoiceDataLoaded),
      takeUntil(this.destroy$),
      map(([contracts, ,]) => {
        return contracts.filter(
          (contract) =>
            allowedStatuses.includes(contract.status as CONTRACT_STATOOS) &&
            contract.invoice &&
            this.invoiceService.isInvoiceMember(contract.invoice, userID)
        );
      })
    );
  }

  receiptNetValue(receipt: ContractReceipt): string {
    if (isBefore(receipt.created, new Date('2023/04/05'))) {
      return this.oldReceiptNetValue(receipt);
    }
    const receiptNetValue = subtractMoney(receipt.value, applyPercentage(receipt.value, receipt.ISS));
    return this.toNetValue(
      receiptNetValue,
      subtractMoney(receipt.notaFiscal, receipt.ISS),
      receipt.nortanPercentage,
      receipt.created
    );
  }

  contractNetValue(contract: Contract): string {
    const contractValueWithoutISS = removePercentage(
      idToProperty(contract.invoice, this.invoiceService.idToInvoice.bind(this.invoiceService), 'value'),
      contract.ISS
    );

    return this.toNetValue(
      this.subtractComissions(contractValueWithoutISS, contract),
      nfPercentage(contract, this.config.invoiceConfig),
      nortanPercentage(contract, this.config.invoiceConfig),
      contract.created
    );
  }

  private oldReceiptNetValue(receipt: ContractReceipt): string {
    if (isBefore(receipt.created, new Date('2022/09/01'))) {
      return this.toNetValue(receipt.value, receipt.notaFiscal, receipt.nortanPercentage, receipt.created);
    }

    let receiptNetValue = receipt.value;
    receiptNetValue = removePercentage(receiptNetValue, receipt.ISS);
    receiptNetValue = this.toNetValue(receiptNetValue, receipt.notaFiscal, receipt.nortanPercentage, receipt.created);
    return receiptNetValue;
  }

  private isUserAnAER(user: User, invoice: Invoice): boolean {
    if (user.AER && user.AER.length != 0) {
      return user.AER.find((member) => this.userService.isEqual(member, invoice.team[0].user)) != undefined;
    }
    return false;
  }

  private latestEndDate(contract: Contract): Date {
    let latestDate = new Date(contract.created);
    for (const item of contract.checklist) {
      if (item.range.end) {
        const currentDate = new Date(item.range.end);
        if (isAfter(currentDate, latestDate)) {
          latestDate = new Date(item.range.end);
        }
      }
    }
    return latestDate;
  }

  openItems(type: CONTRACT_TRANSACTION_TYPES): Observable<ContractTransactionInfo[]> {
    return this.getContracts().pipe(
      map((contracts) => {
        return contracts
          .map((contract) =>
            (contract[type] as (ContractPayment | ContractReceipt | ContractExpense)[])
              .filter((item) => item.paid === false)
              .map((item) => ({
                contract: contract,
                value: item.value,
                payment: type === CONTRACT_TRANSACTION_TYPES.PAYMENTS ? (item as ContractPayment) : undefined,
                receipt: type === CONTRACT_TRANSACTION_TYPES.RECEIPTS ? (item as ContractReceipt) : undefined,
                expense: type === CONTRACT_TRANSACTION_TYPES.EXPENSES ? (item as ContractExpense) : undefined,
                code: (contract[type] as (ContractPayment | ContractReceipt | ContractExpense)[]).indexOf(item),
              }))
          )
          .flat();
      })
    );
  }
}
