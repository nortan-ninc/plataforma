import { Component, Input, OnInit } from '@angular/core';
import { PlatformConfig } from '@models/platformConfig';
import { ExpenseType } from '@models/team';
import { ConfigService } from 'app/shared/services/config.service';
import { UtilsService } from 'app/shared/services/utils.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'ngx-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent {
  @Input() config: PlatformConfig = new PlatformConfig();
  newExpense: ExpenseType = new ExpenseType();
  newRole = { typeName: '', permission: '' };
  newLevel: string = '';
  PERMISSIONS = ['Administrador', 'Membro', 'Financeiro'];
  userService: any;

  expenseIcon = {
    icon: 'minus',
    pack: 'fac',
  };
  invoiceIcon = {
    icon: 'file-invoice-dollar',
    pack: 'fac',
  };

  constructor(private configService: ConfigService, public utils: UtilsService) {}

  addExpenseType(): void {
    this.config.expenseTypes.push(cloneDeep(this.newExpense));
    this.newExpense = new ExpenseType();
  }

  addRole(): void {
    this.config.profileConfig.positions.push(cloneDeep(this.newRole));
    this.newRole.typeName = '';
    this.newRole.permission = '';
  }

  addLevel(): void {
    this.config.profileConfig.levels.push(this.newLevel);
    this.newLevel = '';
  }

  updateConfig(): void {
    this.configService.editConfig(this.config);
  }
}
