import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { SaveModel } from '@models/popup/save-model';

@Component({
  selector: 'app-open-save-dialog',
  templateUrl: './open-save-dialog.component.html',
  styleUrls: [ './open-save-dialog.component.scss' ]
})
export class OpenSaveDialogComponent implements OnInit {

  @ViewChild('item', { static: true }) versionElement: MatSelect;
  items = [];
  resultValue;

  constructor(public dialogRef: MatDialogRef<OpenSaveDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SaveModel) {
    if (this.data.type === 'select') {
      this.resultValue = this.data.items[ 0 ];
    }
  }

  ngOnInit() {
    if (this.data.type === 'select') {
      this.versionElement.focus();
    }
  }

  inputNameError() {
    return this.data.existingNames?.includes(this.resultValue);
  }

  save() {
    this.dialogRef.close({action: this.data.okButton, value: this.resultValue})
  }

  disabled() {
    return this.data.type === 'input' && (!this.resultValue || this.inputNameError())
  }
}
