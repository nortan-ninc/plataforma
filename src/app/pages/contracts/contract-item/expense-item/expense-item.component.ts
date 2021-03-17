import { Component, OnInit, Input } from '@angular/core';
import { NbFileUploaderOptions } from '../../../../@theme/components';
import { format, parseISO } from 'date-fns';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { CompleterData, CompleterService } from 'ng2-completer';
import { ContractService } from '../../../../shared/services/contract.service';
import { UserService } from '../../../../shared/services/user.service';
import * as _ from 'lodash';
import * as expense_validation from '../../../../shared/payment-validation.json';

@Component({
  selector: 'ngx-expense-item',
  templateUrl: './expense-item.component.html',
  styleUrls: ['./expense-item.component.scss'],
})
export class ExpenseItemComponent implements OnInit {
  @Input() contract: any;
  @Input() contractIndex: number;
  @Input() expenseIndex: number;
  validation = (expense_validation as any).default;
  today = new Date();
  EXPENSE_TYPES = [
    'Impostos e Taxas',
    'Pré-Obra',
    'Material',
    'Pagamento de Pessoal',
    'Transporte e Alimentação',
    'Outros',
  ];
  expense: any = {
    paid: false,
    nf: true,
    created: this.today,
    lastUpdate: this.today,
  };
  options = {
    lastUpdateDate: format(this.expense.lastUpdate, 'dd/MM/yyyy'),
  };
  uploaderOptions: NbFileUploaderOptions;
  urls: string[] = [];
  allowedMimeType = ['image/png', 'image/jpg', 'image/jpeg'];
  fileTypesAllowed: string[];
  maxFileSize = 5;

  userSearch: string;
  userData: CompleterData;

  constructor(
    private contractService: ContractService,
    private completerService: CompleterService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.fileTypesAllowed = this.allowedMimeType.map((fileType: string) =>
      fileType.substring(fileType.lastIndexOf('/') + 1, fileType.length)
    );
    this.uploaderOptions = {
      multiple: false,
      directory: false,
      showUploadQueue: true,
      allowedFileTypes: this.allowedMimeType,
      filter: {
        fn: (item: File) => {
          // Verifica se arquivo é maior que maxFileSize mb
          if (item.size / 1024 / 1024 > this.maxFileSize) {
            return false;
          }
          const itemType =
            item.name.substring(
              item.name.lastIndexOf('.') + 1,
              item.name.length
            ) || item.name;
          if (!this.fileTypesAllowed.includes(itemType)) {
            return false;
          }
          return true;
        },
      },
    };

    this.userData = this.completerService
      .local(
        this.contract.team.map((member) => member.user),
        'fullName',
        'fullName'
      )
      .imageField('profilePicture');

    if (this.expenseIndex !== undefined) {
      this.expense = _.cloneDeep(this.contract.expenses[this.expenseIndex]);
      if (
        this.expense.paidDate !== undefined &&
        typeof this.expense.paidDate !== 'object'
      )
        this.expense.paidDate = parseISO(this.expense.paidDate);
      if (
        this.expense.created !== undefined &&
        typeof this.expense.created !== 'object'
      )
        this.expense.created = parseISO(this.expense.created);
      if (
        this.expense.lastUpdate !== undefined &&
        typeof this.expense.lastUpdate !== 'object'
      ) {
        this.expense.lastUpdate = parseISO(this.expense.lastUpdate);
        this.expense.lastUpdate = format(this.expense.lastUpdate, 'dd/MM/yyyy');
      }
      if (this.expense.author?.fullName == undefined)
        this.expense.author = this.userService.idToUser(this.expense.author);
    } else {
      this.userService.currentUser$.pipe(take(1)).subscribe((author) => {
        this.expense.author = author;
      });
    }
    this.userSearch = this.expense.author.fullName;
  }

  urlReceiver(fileList: BehaviorSubject<any>[]): void {
    this.urls = [];
    for (const file$ of fileList) {
      if (file$.getValue().isSuccess || file$.getValue().isError) {
        this.urls.push(file$.getValue().url);
      } else {
        const urlIndex = this.urls.push(file$.getValue().url) - 1;
        file$
          .pipe(take(2))
          .subscribe((file) => (this.urls[urlIndex] = file.url));
      }
    }
  }

  registerExpense(): void {
    if (this.expenseIndex !== undefined) {
      this.expense.lastUpdate = new Date();
      this.contract.expenses[this.expenseIndex] = _.cloneDeep(this.expense);
    } else {
      this.contract.expenses.push(_.cloneDeep(this.expense));
    }
    this.contractService.editContract(this.contract);
  }

  updatePaidDate(): void {
    if (!this.expense.paid) this.expense.paidDate = undefined;
    else this.expense.paidDate = new Date();
  }
}
