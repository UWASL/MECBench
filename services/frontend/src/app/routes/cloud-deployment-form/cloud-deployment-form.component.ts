import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Checkbox } from '@shared/components/form-inputs/checkbox/checkbox';
import { Dropdown } from '@shared/components/form-inputs/dropdown/dropdown';
import { InputBase } from '@shared/components/form-inputs/input-base';
import { InputGeneratorService } from '@shared/services/input-generator.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-cloud-deployment-form',
    templateUrl: './cloud-deployment-form.component.html',
    styleUrls: ['./cloud-deployment-form.component.scss'],
})
export class CloudDeploymentFormComponent implements OnInit {
    form!: FormGroup;
    enableCloudDeployment = new Checkbox({
        key: 'enableCloudDeployment',
        label: 'configuration.enable-cloud-deployment',
    });
    cloudProvider = new Dropdown({
        key: 'cloudProvider',
        label: 'configuration.cloud-provider',
        validation: {
            required: true,
        },
        options: [
            { label: 'configuration.aws', value: 'aws' },
            { label: 'configuration.google-cloud', value: 'google-cloud' },
            { label: 'configuration.microsoft-azure', value: 'microsoft-azure' },
        ],
    });
    instance = new Dropdown({
        key: 'instance',
        label: 'configuration.instance',
        validation: {
            required: true,
        },
    });

    constructor(
        private inputGeneratorService: InputGeneratorService,
        private toastService: ToastrService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.form = this.inputGeneratorService.generateFromGroup([
            this.enableCloudDeployment,
            this.cloudProvider,
            this.instance,
        ]);
    }

    onSave(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            // logic here
            this.toastService.success(this.translateService.instant('others.saved'));
        }
    }

    onCloudProviderUpdate(event: { input: InputBase<Dropdown>; control: FormControl }): void {
        if (event.control.value === 'aws') {
            this.instance.options = [
                { label: 'm5.large', value: 'm5.large' },
                { label: 'm5.xlarge', value: 'm5.xlarge' },
                { label: 'm5.2xlarge', value: 'm5.2xlarge' },
                { label: 'm5.4xlarge', value: 'm5.4xlarge' },
                { label: 'm5.8large', value: 'm5.8large' },
                { label: 'm5.16xlarge', value: 'm5.16xlarge' },
            ];
        } else {
            this.instance.options = [];
        }
    }
}
