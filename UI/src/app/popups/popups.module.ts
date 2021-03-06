import { NgModule } from '@angular/core';
import { AddConstantPopupComponent } from './add-constant-popup/add-constant-popup.component';
import { CdmVersionDialogComponent } from './cdm-version-dialog/cdm-version-dialog.component';
import { CommentPopupComponent } from './comment-popup/comment-popup.component';
import { DeleteWarningComponent } from './delete-warning/delete-warning.component';
import { ErrorPopupComponent } from './error-popup/error-popup.component';
import { OnBoardingComponent } from './on-boarding/on-boarding.component';
import { CdmFilterComponent } from './cdm-filter/cdm-filter.component';
import { OpenSaveDialogComponent } from './open-save-dialog/open-save-dialog.component';
import { PreviewPopupComponent } from './preview-popup/preview-popup.component';
import { PrismComponent } from './preview-popup/prism.component';
import { ResetWarningComponent } from './reset-warning/reset-warning.component';
import { SelectConceptFieldComponent } from './select-concept-field/select-concept-field.component';
import { SelectTableDropdownComponent } from './select-table-dropdown/select-table-dropdown.component';
import { ChooseTransformationTypePopupComponent } from './choose-transformation-type-popup/choose-transformation-type-popup.component';
import { SharedModule } from '@shared/shared.module';
import { TransformationTypeComponent } from './transformation-type/transformation-type.component';
import { SqlFunctionsInjector } from '@models/sql-functions-injector';
import { SQL_FUNCTIONS } from '@models/transformation-input/sql-string-functions';
import { LogoutComponent } from './logout/logout.component';
import { HelpPopupComponent } from './help-popup/help-popup.component';
import { WarningPopupComponent } from './warning-popup/warning-popup.component';
import { SaveMappingDialogComponent } from './save-mapping-dialog/save-mapping-dialog.component';

@NgModule({
  declarations: [
    AddConstantPopupComponent,
    CdmVersionDialogComponent,
    CommentPopupComponent,
    DeleteWarningComponent,
    ErrorPopupComponent,
    OnBoardingComponent,
    CdmFilterComponent,
    OpenSaveDialogComponent,
    PreviewPopupComponent,
    PrismComponent,
    ResetWarningComponent,
    SelectConceptFieldComponent,
    SelectTableDropdownComponent,
    ChooseTransformationTypePopupComponent,
    TransformationTypeComponent,
    LogoutComponent,
    HelpPopupComponent,
    WarningPopupComponent,
    SaveMappingDialogComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    AddConstantPopupComponent,
    CdmVersionDialogComponent,
    CommentPopupComponent,
    DeleteWarningComponent,
    ErrorPopupComponent,
    OnBoardingComponent,
    CdmFilterComponent,
    OpenSaveDialogComponent,
    PreviewPopupComponent,
    PrismComponent,
    ResetWarningComponent,
    SelectConceptFieldComponent,
    SelectTableDropdownComponent,
    ChooseTransformationTypePopupComponent,
    TransformationTypeComponent
  ],
  providers: [
    { provide: SqlFunctionsInjector, useValue: SQL_FUNCTIONS }
  ]
})
export class PopupsModule { }
