import { Component, OnInit, Input, Inject, Optional } from '@angular/core';
import { NB_DOCUMENT, NbDialogRef } from '@nebular/theme';
import { BaseDialogComponent } from 'app/shared/components/base-dialog/base-dialog.component';
import { UtilsService } from 'app/shared/services/utils.service';
import { User } from '@models/user';

@Component({
  selector: 'ngx-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
})
export class UserDialogComponent extends BaseDialogComponent implements OnInit {
  @Input() title = '';
  @Input() user = new User();

  constructor(
    @Inject(NB_DOCUMENT) protected derivedDocument: Document,
    @Optional() protected derivedRef: NbDialogRef<UserDialogComponent>,
    public utils: UtilsService
  ) {
    super(derivedDocument, derivedRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
