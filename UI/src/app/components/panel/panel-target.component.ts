import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BridgeService } from 'src/app/services/bridge.service';

import { CommonService } from 'src/app/services/common.service';
import { StoreService } from 'src/app/services/store.service';
import { BridgeButtonService } from '../bridge-button/service/bridge-button.service';
import { PanelTableComponent } from './panel-table/panel-table.component';
import { PanelBaseComponent } from './panel-base.component';

@Component({
  selector: 'app-panel-target',
  templateUrl: './panel-target.component.html',
  styleUrls: ['./panel-target.component.scss']
})
export class PanelTargetComponent extends PanelBaseComponent {
  @ViewChild('panel') panel: PanelTableComponent;

  constructor(
    public dialog: MatDialog,
    commonService: CommonService,
    bridgeService: BridgeService,
    bridgeButtonService: BridgeButtonService,
    storeService: StoreService
  ) {
    super(dialog, commonService, bridgeService, bridgeButtonService, storeService);
  }
}
