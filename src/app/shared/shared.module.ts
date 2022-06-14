import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbInputModule,
  NbListModule,
  NbUserModule,
  NbDatepickerModule,
} from '@nebular/theme';
import { BrMaskDirective } from './directives/br-mask.directive';
import { FileUploadDialogComponent } from './components/file-upload/file-upload.component';
import { CommonModule } from '@angular/common';
import { NbCompleterModule, NbFileUploaderModule } from '../@theme/components';
import { OverPaidDirective } from './directives/over-paid.directive';
import { LastPaymentDirective } from './directives/last-payment.directive';
import { PdfDialogComponent } from './components/pdf-dialog/pdf-dialog.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { BaseDialogComponent } from './components/base-dialog/base-dialog.component';
import { FabComponent } from './components/fab/fab.component';
import { FabItemComponent } from './components/fab/fab-item/fab-item.component';
import { BaseExpenseComponent } from './components/base-expense/base-expense.component';
import { SelectAllTextDirective } from './directives/select-all-text.directive';
import { TextInputDialogComponent } from 'app/shared/components/text-input-dialog/text-input-dialog.component';
import { SelectorDialogComponent } from './components/selector-dialog/selector-dialog.component';
import { TeamExpensesComponent } from './components/teams/team-expenses/team-expenses.component';
import { TeamExpenseItemComponent } from './components/teams/team-expenses/team-expense-item/team-expense-item.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { UserTransactionComponent } from './components/user-transaction/user-transaction.component';
import { TransformPipe } from './pipes/transform.pipe';
import { EchartsBarComponent } from './components/charts/echarts-bar/echarts-bar.component';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import langPTBR from 'app/shared/langPT-BR';
import { GanttChartComponent } from './components/charts/gantt-chart/gantt-chart.component';
import { ExpansiveListComponent } from './components/expansive-list/expansive-list.component';

echarts.registerLocale('PT-BR', langPTBR);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    NbCompleterModule,
    NbDatepickerModule,
    NbButtonModule,
    NbFileUploaderModule,
    NbIconModule,
    NbInputModule,
    NbListModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTooltipModule,
    NbUserModule,
    Ng2SmartTableModule,
    PdfViewerModule,
    NgxEchartsModule.forRoot({ echarts }),
  ],
  exports: [
    BrMaskDirective,
    OverPaidDirective,
    LastPaymentDirective,
    FabComponent,
    FabItemComponent,
    SelectAllTextDirective,
    TeamExpensesComponent,
    TeamExpenseItemComponent,
    UserTransactionComponent,
    TransformPipe,
    EchartsBarComponent,
    GanttChartComponent,
    ExpansiveListComponent,
  ],
  declarations: [
    BrMaskDirective,
    FileUploadDialogComponent,
    OverPaidDirective,
    LastPaymentDirective,
    PdfDialogComponent,
    ConfirmationDialogComponent,
    BaseDialogComponent,
    FabComponent,
    FabItemComponent,
    BaseExpenseComponent,
    SelectAllTextDirective,
    TextInputDialogComponent,
    SelectorDialogComponent,
    TeamExpensesComponent,
    TeamExpenseItemComponent,
    UserTransactionComponent,
    TransformPipe,
    EchartsBarComponent,
    GanttChartComponent,
    ExpansiveListComponent,
  ],
})
export class SharedModule {}
