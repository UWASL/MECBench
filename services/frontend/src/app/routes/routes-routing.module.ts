import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env/environment';

import { AdminLayoutComponent } from '../theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '../theme/auth-layout/auth-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './sessions/login/login.component';
import { RegisterComponent } from './sessions/register/register.component';
import { AuthGuard } from '@core';
import { LoadGeneratorFormComponent } from './load-generator-form/load-generator-form.component';
import { SystemUnderTestFormComponent } from './system-under-test-form/system-under-test-form.component';
import { NetworkEmulationFormComponent } from './network-emulation-form/network-emulation-form.component';
import { CloudDeploymentFormComponent } from './cloud-deployment-form/cloud-deployment-form.component';
import { RunExperimentComponent } from './run-experiment/run-experiment.component';
import { ExperimentResultsComponent } from './experiment-results/experiment-results.component';
import { ProfileListComponent } from './profile-list/profile-list.component';

const routes: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
            { path: '', redirectTo: 'run-experiment', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'configuration',
                children: [
                    { path: 'load-generator', component: LoadGeneratorFormComponent },
                    { path: 'system-under-test', component: SystemUnderTestFormComponent },
                    { path: 'network-emulation', component: NetworkEmulationFormComponent },
                    { path: 'cloud-deployment', component: CloudDeploymentFormComponent },
                    { path: 'profile-selection', component: ProfileListComponent}
                ],
            },
            { path: 'run-experiment', component: RunExperimentComponent },
            { path: 'experiment-results', component: ExperimentResultsComponent },
        ],
    },
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
        ],
    },
    { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: environment.useHash,
        }),
    ],
    exports: [RouterModule],
})
export class RoutesRoutingModule {}
