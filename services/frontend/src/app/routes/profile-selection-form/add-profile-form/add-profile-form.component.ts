import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Profile } from '@core/mecbench_backend/interface';
import { Textarea } from '@shared/components/form-inputs/textarea/textarea';
import { Textbox } from '@shared/components/form-inputs/textbox/textbox';
import { InputGeneratorService } from '@shared/services/input-generator.service';

@Component({
    selector: 'app-add-profile-form',
    templateUrl: './add-profile-form.component.html',
    styleUrls: ['./add-profile-form.component.scss'],
})
export class AddProfileFormComponent implements OnInit {
    @Input() profile: Profile | undefined;
    form!: FormGroup;
    name = new Textbox({
        key: 'name',
        label: 'configuration.name',
        validation: {
            required: true,
        },
    });
    description = new Textarea({
        key: 'description',
        label: 'configuration.description',
        config: {
            minRows: 1,
        },
    });

    constructor(
        private dialogRef: MatDialogRef<AddProfileFormComponent>,
        private inputGeneratorService: InputGeneratorService,
    ) {}

    ngOnInit(): void {
        this.form = this.inputGeneratorService.generateFromGroup([this.name, this.description]);
        if (this.profile) {
            this.form.patchValue({
                [this.name.key]: this.profile.name,
                [this.description.key]: this.profile.description,
            });
        }
    }

    onSave(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        }
    }
}
