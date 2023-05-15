import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationStoreService } from '@core/configuration/configuration.service';
import { CreateProfileRequest, Profile } from '@core/mecbench_backend/interface';
import { ProfileService } from '@core/mecbench_backend/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { Checkbox } from '@shared/components/form-inputs/checkbox/checkbox';
import { InputGeneratorService } from '@shared/services/input-generator.service';
import { AddProfileFormComponent } from 'app/routes/profile-selection-form/add-profile-form/add-profile-form.component';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-profile-card',
    templateUrl: './profile-card.component.html',
    styleUrls: ['./profile-card.component.scss'],
})
export class ProfileCardComponent implements OnInit, OnChanges {
    @Input() profile!: Profile;
    @Input() selected = false;
    @Output() profileUpdated = new EventEmitter<any>();
    @Output() profileSelected = new EventEmitter<any>();
    selectProfile = new Checkbox({
        key: 'selectProfile',
        label: 'configuration.select-this-profile',
    });
    form!: FormGroup;

    constructor(
        private profileService: ProfileService,
        private dialog: MatDialog,
        private inputGeneratorService: InputGeneratorService,
        private configurationStoreService: ConfigurationStoreService,
        private toastService: ToastrService,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.selectProfile.value = this.selected;
        this.form = this.inputGeneratorService.generateFromGroup([this.selectProfile]);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selected && this.form) {
            this.form.get(this.selectProfile.key)?.patchValue(this.selected);
        }
    }

    openConfirmationDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, { width: '400px' });
        dialogRef.componentInstance.message = 'configuration.delete-profile-confirmation';
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteProfile();
            }
        });
    }

    deleteProfile(): void {
        this.profileService.deleteProfile(this.profile.id).subscribe(() => {
            this.toastService.success(
                this.translateService.instant('configuration.profile-deleted-successfully')
            );
            this.profileUpdated.emit();
        });
    }

    onProfileSelectUpdate(event: { input: Checkbox; control: FormControl }): void {
        if (event.control.value) {
            this.profileSelected.emit();
        }
    }

    openProfileForm(): void {
        const dialogRef = this.dialog.open(AddProfileFormComponent, { width: '400px' });
        dialogRef.componentInstance.profile = this.profile;
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.updateProfile(result.name, result.description);
            }
        });
    }

    updateProfile(name: string, description?: string): void {
        const currentConfiguration = this.configurationStoreService.getCurrentConfiguration();
        const updatedProfile: CreateProfileRequest = {
            ...(currentConfiguration || this.profile),
            name,
            description,
        };
        this.profileService.updateProfile(this.profile.id, updatedProfile).subscribe(() => {
            this.toastService.success(
                this.translateService.instant('configuration.profile-updated-successfully')
            );
            this.profileUpdated.emit();
        });
    }
}
