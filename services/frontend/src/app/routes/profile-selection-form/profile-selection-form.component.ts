import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Dropdown } from '@shared/components/form-inputs/dropdown/dropdown';
import { InputGeneratorService } from '@shared/services/input-generator.service';
import { ProfileService } from '@core/mecbench_backend/profile.service';
import { CreateProfileRequest, Profile } from '@core/mecbench_backend/interface';
import { ConfigurationStoreService } from '@core/configuration/configuration.service';
import { MatDialog } from '@angular/material/dialog';
import { AddProfileFormComponent } from './add-profile-form/add-profile-form.component';

@Component({
    selector: 'profile-selection-form',
    templateUrl: './profile-selection-form.component.html',
    styleUrls: ['./profile-selection-form.component.scss'],
})
export class ProfileSelectionFormComponent implements OnInit {
    profiles: Profile[] = [];
    form!: FormGroup;
    profile = new Dropdown({
        key: 'profile',
        label: 'configuration.profile',
        validation: {
            required: true,
        },
    });
    description = '';

    constructor(
        private inputGeneratorService: InputGeneratorService,
        private profileService: ProfileService,
        private configurationStoreService: ConfigurationStoreService,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.form = this.inputGeneratorService.generateFromGroup([this.profile]);
        this.getAllProfiles();
    }

    getAllProfiles(): void {
        this.profileService.getProfiles().subscribe(res => {
            this.profiles = res.profiles;
            this.profile.options = this.profiles.map((profile: Profile) => {
                return { label: profile.name, value: profile.id.toString() };
            });
        });
    }

    onSave(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            const selectedProfile = this.profiles.find((profile: Profile) => {
                return profile.id.toString() === this.form.value.profile;
            });
            if (selectedProfile) {
                this.configurationStoreService.setConfiguration(selectedProfile);
            }
        }
    }

    onProfileUpdate(event: { input: Dropdown; control: FormControl }): void {
        if (event.control.value) {
            const selectedProfile = this.profiles.find((profile: Profile) => {
                return profile.id.toString() === this.form.value.profile;
            });
            this.description = selectedProfile?.description || '';
        }
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
            this.getAllProfiles();
        });
    }
}
