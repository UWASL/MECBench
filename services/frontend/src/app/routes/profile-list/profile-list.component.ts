import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationStoreService } from '@core/configuration/configuration.service';
import { MECBenchConfiguration } from '@core/configuration/interface';
import { CreateProfileRequest, Profile } from '@core/mecbench_backend/interface';
import { ProfileService } from '@core/mecbench_backend/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AddProfileFormComponent } from '../profile-selection-form/add-profile-form/add-profile-form.component';

@Component({
    selector: 'app-profile-list',
    templateUrl: './profile-list.component.html',
    styleUrls: ['./profile-list.component.scss'],
})
export class ProfileListComponent implements OnInit {
    profiles: Profile[] = [];
    selectedProfiles: boolean[] = [];
    currentConfig: MECBenchConfiguration | undefined;

    constructor(
        private profileService: ProfileService,
        private configurationStoreService: ConfigurationStoreService,
        private dialog: MatDialog,
        private toastService: ToastrService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.currentConfig = this.configurationStoreService.getCurrentConfiguration();
        this.getAllProfiles();
    }

    getAllProfiles(): void {
        this.profileService.getProfiles().subscribe(res => {
            this.profiles = res.profiles;
            this.selectedProfiles = this.profiles.map(profile => {
                if (profile.id == (this.currentConfig as any)?.id) {
                    return true;
                }
                return false;
            });
        });
    }

    onProfileSelected(selectedProfile: Profile): void {
        this.profiles.forEach((profile, index) => {
            if (profile.id === selectedProfile.id) {
                this.selectedProfiles[index] = true;
            } else {
                this.selectedProfiles[index] = false;
            }
        });
        this.configurationStoreService.setConfiguration(selectedProfile);
    }

    openAddProfileForm(): void {
        const dialogRef = this.dialog.open(AddProfileFormComponent, { width: '400px' });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createProfile(result.name, result.description);
            }
        });
    }

    createProfile(name: string, description?: string): void {
        const profile: CreateProfileRequest = {
            ...this.configurationStoreService.getCurrentConfiguration(),
            name,
            description,
        };
        delete (profile as any).id;
        this.profileService.createProfile(profile).subscribe(() => {
            this.toastService.success(
                this.translateService.instant('configuration.profile-created-successfully')
            );
            this.getAllProfiles();
        });
    }
}
