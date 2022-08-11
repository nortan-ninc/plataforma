import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NbDialogService } from '@nebular/theme';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, combineLatest, Observable, skipWhile, take } from 'rxjs';

import { RemainingItemsComponent } from './remaining-items/remaining-items.component';
import { ConfigService, EXPENSE_TYPES } from 'app/shared/services/config.service';
import { InvoiceService } from 'app/shared/services/invoice.service';
import { UserService } from 'app/shared/services/user.service';
import { getItemsWithValue, isPhone, tooltipTriggers, trackByIndex } from 'app/shared/utils';

import { Invoice } from '@models/invoice';
import { PlatformConfig } from '@models/platformConfig';
import { User } from '@models/user';

import config_validation from 'app/shared/validators/config-validation.json';

interface SubTypeItem {
  name: string;
  isNew: boolean;
}

interface TypeItem {
  name: string;
  subTypes: SubTypeItem[];
}
enum KEYS_TO_VERIFY {
  POSITION = 'position',
  LEVEL = 'level',
  UNIT = 'products.unit',
}

enum CONFIG_EXPENSE_TYPES {
  ADMINISTRATIVA = 'Administrativa',
  CONTRATO = 'Contrato',
}

@Component({
  selector: 'ngx-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  @ViewChildren(NgForm) ngForms = {} as QueryList<NgForm>;
  @Input() config: PlatformConfig = new PlatformConfig();
  @Input() isFormDirty = new BehaviorSubject<boolean>(false);
  clonedConfig: PlatformConfig = new PlatformConfig();
  newAdminExpense: TypeItem = { name: '', subTypes: [] };
  newContractExpense: TypeItem = { name: '', subTypes: [] };
  newRole = { roleTypeName: '', permission: '' };
  adminExpenseTypes: TypeItem[] = [];
  contractExpenseTypes: TypeItem[] = [];
  invoices: Invoice[] = [];
  users: User[] = [];
  PERMISSIONS = ['Administrador', 'Membro', 'Financeiro'];
  PARENTS = ['Diretor de T.I', 'Diretor Financeiro', 'Associado'];
  EXPENSE_TYPES = EXPENSE_TYPES;
  configExpenseTypes = CONFIG_EXPENSE_TYPES;
  KEYS_TO_VERIFY = KEYS_TO_VERIFY;
  newLevel: string = '';
  newUnit: string = '';
  validation = config_validation as any;
  errorInPositions = false;
  errorInLevels = false;

  forms: NgForm[] = [];

  isPhone = isPhone;
  trackByIndex = trackByIndex;
  tooltipTriggers = tooltipTriggers;

  expenseIcon = {
    icon: 'minus',
    pack: 'fac',
  };
  invoiceIcon = {
    icon: 'file-invoice-dollar',
    pack: 'fac',
  };
  onedriveIcon = {
    icon: 'onedrive',
    pack: 'fac',
  };

  constructor(
    private configService: ConfigService,
    private invoiceService: InvoiceService,
    private dialogService: NbDialogService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.clonedConfig = cloneDeep(this.config);
    this.adminExpenseTypes = this.clonedConfig.expenseConfig.adminExpenseTypes.map((eType: any) => {
      const typeItem = cloneDeep(eType);
      if (typeItem.subTypes.length) {
        typeItem.subTypes = typeItem.subTypes.map((subType: any) => ({
          name: subType,
          isNew: false,
        }));
      }
      typeItem.subTypes = typeItem.subTypes as SubTypeItem[];
      return typeItem;
    });
    this.contractExpenseTypes = this.clonedConfig.expenseConfig.contractExpenseTypes.map((eType: any) => {
      const typeItem = cloneDeep(eType);
      if (typeItem.subTypes.length) {
        typeItem.subTypes = typeItem.subTypes.map((subType: any) => ({
          name: subType,
          isNew: false,
        }));
      }
      typeItem.subTypes = typeItem.subTypes as SubTypeItem[];
      return typeItem;
    });
  }

  ngAfterViewInit() {
    const observables$ = this.ngForms
      .map((form) => form.statusChanges)
      .filter((observable$): observable$ is Observable<any> => observable$ != undefined);
    this.forms = this.ngForms.toArray();
    combineLatest(observables$).subscribe(() => {
      const isDirty = this.forms.some((form) => {
        if (form.dirty) return true;
        return false;
      });
      if (isDirty) {
        this.isFormDirty.next(true);
      }
    });
  }

  openDialog(itemsWithValue: string[], warning: string): void {
    this.dialogService.open(RemainingItemsComponent, {
      context: {
        title: warning,
        items: itemsWithValue,
      },
      dialogClass: 'my-dialog',
      closeOnBackdropClick: false,
      closeOnEsc: false,
      autoFocus: false,
    });
  }

  addExpenseType(expenseType: CONFIG_EXPENSE_TYPES): void {
    if (expenseType == CONFIG_EXPENSE_TYPES.ADMINISTRATIVA) {
      this.adminExpenseTypes.push(this.newAdminExpense);
      this.newAdminExpense = { name: '', subTypes: [] };
    } else if (expenseType == CONFIG_EXPENSE_TYPES.CONTRATO) {
      this.contractExpenseTypes.push(cloneDeep(this.newContractExpense));
      this.newContractExpense = { name: '', subTypes: [] };
    }
  }

  addRole(): void {
    this.errorInPositions = this.clonedConfig.profileConfig.positions.some(
      (pos) => pos.roleTypeName === this.newRole.roleTypeName || this.PARENTS.includes(this.newRole.roleTypeName)
    );
    if (!this.errorInPositions) this.clonedConfig.profileConfig.positions.push(cloneDeep(this.newRole));
    this.newRole.roleTypeName = '';
    this.newRole.permission = '';
  }

  addLevel(): void {
    this.errorInLevels = this.clonedConfig.profileConfig.levels.includes(this.newLevel);
    if (!this.errorInLevels) this.clonedConfig.profileConfig.levels.push(this.newLevel);
    this.newLevel = '';
  }

  addUnit(): void {
    this.clonedConfig.invoiceConfig.units.push(this.newUnit);
    this.newUnit = '';
  }

  updateConfig(): void {
    this.clonedConfig.expenseConfig.adminExpenseTypes = this.adminExpenseTypes.map((eType: any) => {
      const typeItem = cloneDeep(eType);
      if (typeItem.subTypes.length) {
        typeItem.subTypes = typeItem.subTypes.map((subType: any) => subType.name);
      }
      typeItem.subTypes = typeItem.subTypes as string[];
      return typeItem;
    });
    this.clonedConfig.expenseConfig.contractExpenseTypes = this.contractExpenseTypes.map((eType: any) => {
      const typeItem = cloneDeep(eType);
      if (typeItem.subTypes.length) {
        typeItem.subTypes = typeItem.subTypes.map((subType: any) => subType.name);
      }
      typeItem.subTypes = typeItem.subTypes as string[];
      return typeItem;
    });
    this.isFormDirty.next(false);
    if (this.clonedConfig.expenseConfig.isDuplicated)
      this.clonedConfig.expenseConfig.contractExpenseTypes = cloneDeep(
        this.clonedConfig.expenseConfig.adminExpenseTypes
      );
    this.configService.editConfig(this.clonedConfig);
  }

  deleteUnit(i: number): void {
    combineLatest([this.invoiceService.getInvoices(), this.invoiceService.isDataLoaded$])
      .pipe(
        skipWhile(([, isInvoiceDataLoaded]) => !isInvoiceDataLoaded),
        take(1)
      )
      .subscribe(([invoices, _]) => {
        const invoicesWithUnit = getItemsWithValue(
          invoices,
          KEYS_TO_VERIFY.UNIT,
          this.clonedConfig.invoiceConfig.units[i]
        );
        const productsWithValue: string[] = [];
        invoicesWithUnit.forEach((invoice) => {
          invoice.products.forEach((product) => productsWithValue.push(product.name + ': ' + invoice.code));
        });
        if (invoicesWithUnit.length != 0) {
          this.openDialog(
            productsWithValue,
            'Não é possível remover o item. Os seguintes produtos dos orçamentos estão utilizando esta unidade:'
          );
        } else {
          this.clonedConfig.invoiceConfig.units.splice(i, 1);
          this.isFormDirty.next(true);
        }
      });
  }

  deletePositionOrLevel(i: number, key: string): void {
    combineLatest([this.userService.getUsers(), this.userService.isDataLoaded$])
      .pipe(
        skipWhile(([, isUserDataLoaded]) => !isUserDataLoaded),
        take(1)
      )
      .subscribe(([users, _]) => {
        const usersWithValue = getItemsWithValue(
          users,
          key,
          key == 'position'
            ? this.clonedConfig.profileConfig.positions[i].roleTypeName
            : this.clonedConfig.profileConfig.levels[i]
        );
        if (usersWithValue.length != 0) {
          this.openDialog(
            usersWithValue.map((user) => user.fullName),
            'Não é possível remover o item. Os seguintes usuários estão utilizando este ' +
              (key == 'position' ? 'papel:' : 'cargo:')
          );
        } else {
          if (key == 'position') this.clonedConfig.profileConfig.positions.splice(i, 1);
          else this.clonedConfig.profileConfig.levels.splice(i, 1);

          this.isFormDirty.next(true);
        }
      });
  }
}
