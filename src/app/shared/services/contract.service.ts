import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StringUtilService } from './string-util.service';
import { WebSocketService } from './web-socket.service';
import { take, takeUntil } from 'rxjs/operators';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class ContractService implements OnDestroy {
  private requested = false;
  private size$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();
  private contracts$ = new BehaviorSubject<any[]>([]);

  constructor(
    private http: HttpClient,
    private wsService: WebSocketService,
    private stringUtil: StringUtilService,
    private socket: Socket
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveContract(invoice: any): void {
    const currentTime = new Date();
    const contract = {
      invoice: invoice._id,
      payments: [],
      status: 'Em andamento',
      version: '00',
      total: '1',
      created: currentTime,
      lastUpdate: currentTime,
    };
    const req = {
      contract: contract,
    };
    this.http.post('/api/contract/', req).pipe(take(1)).subscribe();
  }

  editContract(contract: any): void {
    const currentTime = new Date();
    contract.lastUpdate = currentTime;
    let tmp = Object.assign({}, contract);
    const req = {
      contract: tmp,
    };
    this.http.post('/api/contract/update', req).pipe(take(1)).subscribe();
  }

  getContracts(): Observable<any[]> {
    if (!this.requested) {
      this.requested = true;
      this.http
        .post('/api/contract/all', {})
        .pipe(take(1))
        .subscribe((contracts: any[]) => {
          this.contracts$.next(contracts);
        });
      this.socket
        .fromEvent('dbchange')
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) =>
          this.wsService.handle(data, this.contracts$, 'contracts')
        );
    }
    return this.contracts$;
  }

  contractsSize(): Observable<number> {
    this.http
      .post('/api/contract/count', {})
      .pipe(take(1))
      .subscribe((numberJson) => {
        this.size$.next(+numberJson['size'] + 1);
      });
    return this.size$;
  }

  idToContract(id: string): any {
    if (id === undefined) return undefined;
    const tmp = this.contracts$.getValue();
    return tmp[tmp.findIndex((el) => el._id === id)];
  }

  hasPayments(cId: any, uId: string): { hasPayments: boolean; value: number } {
    const contract = cId._id == undefined ? this.idToContract(cId) : cId;
    if (contract.payments.length == 0) return { hasPayments: false, value: 0 };
    const paid = contract.payments.reduce((paid, payment) => {
      if (payment.paid == 'não') return paid;
      return (paid += payment.team.reduce((upaid, member) => {
        const author =
          member.user._id == undefined ? member.user : member.user._id;
        if (author == uId)
          return (upaid += this.stringUtil.moneyToNumber(member.value));
        return upaid;
      }, 0));
    }, 0);
    return { hasPayments: paid > 0, value: paid };
  }
}
