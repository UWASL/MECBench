import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Dropdown } from '@shared/components/form-inputs/dropdown/dropdown';
import { Textbox } from '@shared/components/form-inputs/textbox/textbox';
import { InputGeneratorService } from '@shared/services/input-generator.service';
import { ConfigurationStoreService } from '@core/configuration/configuration.service';
import { MECBenchConfiguration, SUTConfiguration } from '@core/configuration/interface';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-system-under-test-form',
    templateUrl: './system-under-test-form.component.html',
    styleUrls: ['./system-under-test-form.component.scss'],
})
export class SystemUnderTestFormComponent implements OnInit {
    sut?: SUTConfiguration;
    form!: FormGroup;
    modelThreads = new Textbox({
        key: 'modelThreads',
        label: 'configuration.model-threads',
        type: 'number',
        validation: {
            required: true,
            min: 0,
        },
        config: {
            hint: 'configuration.model-threads-hint',
        },
    });
    model = new Dropdown({
        key: 'model',
        label: 'configuration.model',
        validation: {
            required: true,
        },
        options: [
            { label: 'SSD-Mobilenet', value: 'ssd-mobilenet' },
            { label: 'SpaCy', value: 'spacy' },
        ],
        config: {
            hint: 'configuration.model-hint',
        },
    });
    runtime = new Textbox({
        key: 'runtime',
        label: 'configuration.runtime',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.runtime-hint',
        },
        options: [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' },
        ],
    });
    consumerThreads = new Textbox({
        key: 'consumerThreads',
        label: 'configuration.consumer-threads',
        type: 'number',
        validation: {
            required: true,
            min: 0,
        },
        config: {
            hint: 'configuration.consumer-threads-hint',
        },
    });
    cpu = new Textbox({
        key: 'cpu',
        label: 'configuration.cpu',
        config: {
            hint: 'configuration.cpu-hint',
        },
    });
    memory = new Textbox({
        key: 'memory',
        label: 'configuration.memory',
        config: {
            hint: 'configuration.memory-hint',
        },
    });

    constructor(
        private inputGeneratorService: InputGeneratorService,
        private configurationStoreService: ConfigurationStoreService,
        private toastService: ToastrService,
        private translateService: TranslateService,
    ) { }

    ngOnInit(): void {
        this.addFormControls();
        this.getSutConfiguration();
    }

    addFormControls(): void {
        this.form = this.inputGeneratorService.generateFromGroup([
            this.modelThreads,
            this.model,
            this.runtime,
            this.consumerThreads,
            this.cpu,
            this.memory,
        ]);
    }

    getSutConfiguration() :void {
        this.configurationStoreService.configuration$.subscribe((config: MECBenchConfiguration | undefined) => {
            this.sut = config?.sut;
            this.form.patchValue(this.sut!!);
        });
    }

    onSave(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.sut = {
                modelThreads: parseInt(this.form.value.modelThreads),
                model: this.form.value.model,
                runtime: this.form.value.runtime,
                consumerThreads: parseInt(this.form.value.consumerThreads),
            };
            this.configurationStoreService.setSUT(this.sut!!);
            this.toastService.success(this.translateService.instant('others.saved'));
        }
    }
}

