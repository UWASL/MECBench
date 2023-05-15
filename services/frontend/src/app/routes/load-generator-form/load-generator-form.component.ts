import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Textbox } from '@shared/components/form-inputs/textbox/textbox';
import { InputGeneratorService } from '@shared/services/input-generator.service';
import { Dropdown } from '@shared/components/form-inputs/dropdown/dropdown';
import { EXPERIMENT_MODES, SCENARIOS } from '@shared/constants';
import { ConfigurationStoreService } from '@core/configuration/configuration.service';
import { LoadGenConfiguration, MECBenchConfiguration } from '@core/configuration/interface';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-load-generator-form',
    templateUrl: './load-generator-form.component.html',
    styleUrls: ['./load-generator-form.component.scss'],
})
export class LoadGeneratorFormComponent implements OnInit {
    loadGen?: LoadGenConfiguration;
    form!: FormGroup;
    dataset = new Dropdown({
        key: 'dataset_id',
        label: 'configuration.dataset',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.dataset-hint',
        },
        options: [{ label: 'Coco', value: 's3://mlperf-cocodatasets/300.tar.gz' }],
    });
    scenario = new Dropdown({
        key: 'scenario',
        label: 'configuration.scenario',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.scenario-hint',
        },
        options: [
            { label: 'configuration.single-stream', value: SCENARIOS.SINGLE_STREAM },
            { label: 'configuration.multi-stream', value: SCENARIOS.MULTI_STREAM },
            { label: 'configuration.offline', value: SCENARIOS.OFFLINE },
            { label: 'configuration.server', value: SCENARIOS.SERVER },
        ],
    });
    repeat = new Textbox({
        key: 'repeats',
        label: 'configuration.repeat',
        type: 'number',
        validation: {
            min: 0,
        },
        config: {
            hint: 'configuration.repeat-hint',
        },
    });
    minNumberOfThreads = new Textbox({
        key: 'min_num_threads',
        label: 'configuration.min-number-of-threads',
        type: 'number',
        validation: {
            required: true,
            min: 0,
        },
        config: {
            hint: 'configuration.min-number-of-threads-hint',
        },
    });
    maxNumberOfThreads = new Textbox({
        key: 'max_num_threads',
        label: 'configuration.max-number-of-threads',
        type: 'number',
        validation: {
            required: true,
            min: 0,
        },
        config: {
            hint: 'configuration.max-number-of-threads-hint',
        },
    });
    minDuration = new Textbox({
        key: 'min_duration',
        label: 'configuration.min-duration',
        type: 'number',
        validation: {
            required: true,
            min: 0,
        },
        config: {
            hint: 'configuration.min-duration-hint',
        },
    });
    maxDuration = new Textbox({
        key: 'max_duration',
        label: 'configuration.max-duration',
        type: 'number',
        validation: {
            required: true,
            min: 0,
        },
        config: {
            hint: 'configuration.max-duration-hint',
        },
    });
    targetQps = new Textbox({
        key: 'target_qps',
        label: 'configuration.target-qps',
        type: 'number',
        validation: {
            required: true,
            min: 0,
        },
        config: {
            hint: 'configuration.target-qps-hint',
        },
    });
    mode = new Dropdown({
        key: 'mode',
        label: 'configuration.mode',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.mode-hint',
        },
        options: [
            { label: 'configuration.submission-run', value: EXPERIMENT_MODES.SUBMISSION_RUN + '' },
            { label: 'configuration.accuracy-only', value: EXPERIMENT_MODES.ACCURACY_ONLY + '' },
            {
                label: 'configuration.performance-only',
                value: EXPERIMENT_MODES.PERFORMANCE_ONLY + '',
            },
            {
                label: 'configuration.peak-performance',
                value: EXPERIMENT_MODES.PEAK_PERFORMANCE + '',
            },
        ],
    });
    samplesPerQuery = new Textbox({
        key: 'samples_per_query',
        label: 'configuration.samples-per-query',
        type: 'number',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.samples-per-query-hint',
        },
    });
    maxOutgoingQueries = new Textbox({
        key: 'max_async_queries',
        label: 'configuration.maximum-outgoing-queries',
        type: 'number',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.max-outgoing-queries-hint',
        },
    });

    constructor(
        private inputGeneratorService: InputGeneratorService,
        private configurationStoreService: ConfigurationStoreService,
        private toastService: ToastrService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.addFormControls();
        this.getLoadGenConfiguration();
    }

    addFormControls(): void {
        this.form = this.inputGeneratorService.generateFromGroup([
            this.dataset,
            this.scenario,
            this.repeat,
            this.minNumberOfThreads,
            this.maxNumberOfThreads,
            this.minDuration,
            this.maxDuration,
            this.targetQps,
            this.mode,
            this.samplesPerQuery,
            this.maxOutgoingQueries,
        ]);
    }

    getLoadGenConfiguration() {
        this.configurationStoreService.configuration$.subscribe(
            (mecbenchConfiguration: MECBenchConfiguration | undefined) => {
                this.loadGen = mecbenchConfiguration?.loadgen;
                const numberOfThreads = this.loadGen?.num_threads;
                let minNumberOfThreads = 0;
                let maxNumberOfThreads = 0;
                if (numberOfThreads?.includes('-')) {
                    const arr = numberOfThreads.split('-');
                    minNumberOfThreads = parseInt(arr[0]);
                    maxNumberOfThreads = parseInt(arr[1]);
                } else {
                    minNumberOfThreads = parseInt(numberOfThreads + '');
                    maxNumberOfThreads = minNumberOfThreads + 1;
                }
                this.form.patchValue({
                    ...this.loadGen,
                    [this.minNumberOfThreads.key]: minNumberOfThreads,
                    [this.maxNumberOfThreads.key]: maxNumberOfThreads,
                });
            }
        );
    }

    onSave(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.loadGen = {
                ...this.form.value,
                [this.repeat.key]: parseInt(this.form.value[this.repeat.key]),
                num_threads: `${this.form.value[this.minNumberOfThreads.key]}-${
                    this.form.value[this.maxNumberOfThreads.key]
                }`,
            };
            delete (this.loadGen as any)[this.minNumberOfThreads.key];
            delete (this.loadGen as any)[this.maxNumberOfThreads.key];
            this.configurationStoreService.setLoadGen(this.loadGen!!);
            this.toastService.success(this.translateService.instant('others.saved'));
        }
    }
}
