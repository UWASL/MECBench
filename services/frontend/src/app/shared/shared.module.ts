import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { MaterialExtensionsModule } from '../material-extensions.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { NgProgressModule } from 'ngx-progressbar';
import { NgProgressHttpModule } from 'ngx-progressbar/http';
import { NgProgressRouterModule } from 'ngx-progressbar/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { MateroPageHeaderComponent } from './components/matero-page-header/matero-page-header.component';
import { ErrorCodeComponent } from './components/error-code/error-code.component';
import { DisableControlDirective } from './directives/disable-control.directive';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { ToObservablePipe } from './pipes/to-observable.pipe';
import { MatSelectModule } from '@angular/material/select';
import { TextboxComponent } from './components/form-inputs/textbox/textbox.component';
import { DropdownComponent } from './components/form-inputs/dropdown/dropdown.component';
import { CheckboxComponent } from './components/form-inputs/checkbox/checkbox.component';
import { FormInputComponent } from './components/form-inputs/form-input/form-input.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { TextareaComponent } from './components/form-inputs/textarea/textarea.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ChartComponent } from './components/chart/chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';

const MODULES: any[] = [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MaterialExtensionsModule,
    FlexLayoutModule,
    FormlyModule,
    FormlyMaterialModule,
    NgProgressModule,
    NgProgressRouterModule,
    NgProgressHttpModule,
    NgxPermissionsModule,
    ToastrModule,
    TranslateModule,
    MatSelectModule,
    NgApexchartsModule,
];
const COMPONENTS: any[] = [
    BreadcrumbComponent,
    MateroPageHeaderComponent,
    ErrorCodeComponent,
    TextboxComponent,
    DropdownComponent,
    CheckboxComponent,
    FormInputComponent,
    PageHeaderComponent,
    TextareaComponent,
    ConfirmationDialogComponent,
    ChartComponent,
];
const COMPONENTS_DYNAMIC: any[] = [];
const DIRECTIVES: any[] = [DisableControlDirective];
const PIPES: any[] = [SafeUrlPipe, ToObservablePipe];

@NgModule({
    imports: [...MODULES],
    exports: [...MODULES, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
    declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC, ...DIRECTIVES, ...PIPES],
})
export class SharedModule {}
