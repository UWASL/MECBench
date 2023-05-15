import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfigurationStoreService } from '@core/configuration/configuration.service';
import { LoadGenConfiguration, MECBenchConfiguration } from '@core/configuration/interface';
import { TranslateService } from '@ngx-translate/core';
import { Textbox } from '@shared/components/form-inputs/textbox/textbox';
import { LoadGenInstanceRequest } from '@shared/models/load-generator.model';
import { InputGeneratorService } from '@shared/services/input-generator.service';
import { ToastrService } from 'ngx-toastr';
import { LoadGeneratorService } from '../services/load-generator.service';

@Component({
    selector: 'app-run-experiment',
    templateUrl: './run-experiment.component.html',
    styleUrls: ['./run-experiment.component.scss'],
})
export class RunExperimentComponent implements OnInit {
    form!: FormGroup;
    loadGen?: LoadGenConfiguration;
    eid = new Textbox({
        key: 'eid',
        label: 'configuration.experiment-id',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.eid-hint',
        },
    });
    experimentRunning = false;

    constructor(
        private inputGeneratorService: InputGeneratorService,
        private loadGeneratorService: LoadGeneratorService,
        private configurationStoreService: ConfigurationStoreService,
        private translateService: TranslateService,
        private toastService: ToastrService
    ) {}

    ngOnInit(): void {
        this.form = this.inputGeneratorService.generateFromGroup([this.eid]);
        this.getLoadGenConfiguration();
    }

    getLoadGenConfiguration() {
        this.configurationStoreService.configuration$.subscribe(
            (mecbenchConfiguration: MECBenchConfiguration | undefined) => {
                this.loadGen = mecbenchConfiguration?.loadgen;
            }
        );
    }

    onRunClick(): void {
        this.form.markAllAsTouched();
        if (this.form.valid && this.loadGen) {
            this.runLoadGeneratorService();
        }
    }

    runLoadGeneratorService(): void {
        if (this.loadGen) {
            const eid = this.form.value[this.eid.key];
            const selector = this.loadGen?.num_threads?.split('-')[0];
            const payload: LoadGenInstanceRequest = {
                models: [
                    {
                        model_name: '*',
                        scenarios: [
                            {
                                scenario_name: '*',
                                config: {
                                    num_threads: this.loadGen?.num_threads,
                                    min_duration: this.loadGen?.min_duration,
                                    max_duration: this.loadGen?.max_duration,
                                    target_qps: this.loadGen?.target_qps,
                                    mode: this.loadGen?.mode,
                                    samples_per_query: this.loadGen?.samples_per_query,
                                    max_async_queries: this.loadGen?.max_async_queries,
                                },
                            },
                        ],
                    },
                ],
                dataset_id: this.loadGen?.dataset_id,
                scenario: this.loadGen?.scenario,
                repeats: this.loadGen?.repeats,
            };
            this.experimentRunning = true;
            this.loadGeneratorService.runLoadGeneratorInstance(eid, selector, payload).subscribe(
                () => {
                    this.experimentRunning = false;
                    this.toastService.success(
                        this.translateService.instant('experiments.experiment-ran-successfully')
                    );
                },
                () => {
                    this.experimentRunning = false;
                }
            );
        }
    }
}
