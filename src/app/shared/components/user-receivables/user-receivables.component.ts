import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Contract } from '@models/contract';
import { Invoice } from '@models/invoice';
import { NbDialogService } from '@nebular/theme';
import {
  ContractDialogComponent,
  COMPONENT_TYPES,
} from 'app/pages/contracts/contract-dialog/contract-dialog.component';
import { InvoiceService } from 'app/shared/services/invoice.service';
import { ReceivableByContract } from 'app/shared/services/metrics.service';
import { UserService } from 'app/shared/services/user.service';
import { UtilsService } from 'app/shared/services/utils.service';
import { LocalDataSource } from 'ng2-smart-table';
import { BehaviorSubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ngx-user-receivables',
  templateUrl: './user-receivables.component.html',
  styleUrls: ['./user-receivables.component.scss'],
})
export class UserReceivablesComponent implements OnInit, OnDestroy {
  @Input() isDialogBlocked = new BehaviorSubject<boolean>(false);
  @Input() userReceivableContracts: ReceivableByContract[] = [];
  destroy$ = new Subject<void>();
  source: LocalDataSource = new LocalDataSource();
  searchQuery = '';

  settings = {
    mode: 'external',
    noDataMessage: 'Não encontramos nenhum contrato para o filtro selecionado.',
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: false,
    },
    actions: {
      columnTitle: 'Ações',
      add: false,
      edit: true,
      delete: false,
    },
    columns: {
      code: {
        title: 'Contrato',
        type: 'string',
      },
      contractor: {
        title: 'Cliente',
        type: 'string',
      },
      name: {
        title: 'Empreendimento',
        type: 'string',
      },
      receivableValue: {
        title: 'Valor a receber',
        type: 'string',
        sortDirection: 'desc',
        compareFunction: this.valueSort,
      },
    },
  };

  get filteredReceivables(): ReceivableByContract[] {
    if (this.searchQuery !== '')
      return this.userReceivableContracts.filter((receivable) => {
        return (
          receivable.contract.code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          receivable.contract.contractor.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          receivable.contract.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          receivable.receivableValue.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    return this.userReceivableContracts;
  }

  constructor(
    public utils: UtilsService,
    private dialogService: NbDialogService,
    private invoiceService: InvoiceService,
    private userService: UserService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.source.load(
      this.userReceivableContracts.map((receivable) => {
        return {
          contract: receivable.contract,
          code: receivable.contract.code,
          contractor: receivable.contract.contractor,
          name: receivable.contract.name,
          receivableValue: receivable.receivableValue,
        };
      })
    );
  }

  contractDialog(event: { data?: ReceivableByContract }): void {
    this.isDialogBlocked.next(true);
    this.dialogService
      .open(ContractDialogComponent, {
        context: {
          title: 'EDIÇÃO DE CONTRATO',
          contract: event.data ? event.data.contract : new Contract(),
          componentType: COMPONENT_TYPES.CONTRACT,
        },
        dialogClass: 'my-dialog',
        closeOnBackdropClick: false,
        closeOnEsc: false,
        autoFocus: false,
      })
      .onClose.pipe(take(1))
      .subscribe(() => {
        this.isDialogBlocked.next(false);
      });
  }

  valueSort(direction: number, a: string, b: string): number {
    const first = +a.replace(/[,.]/g, '');
    const second = +b.replace(/[,.]/g, '');

    if (first < second) {
      return -1 * direction;
    }
    if (first > second) {
      return direction;
    }
    return 0;
  }

  invoiceAuthorPic(iId: string | Invoice | undefined): string {
    if (iId === undefined) return '';
    const invoice = this.invoiceService.idToInvoice(iId);
    if (invoice.author === undefined) return '';
    const pic = this.userService.idToUser(invoice.author).profilePicture;
    if (pic === undefined) return '';
    return pic;
  }
}
