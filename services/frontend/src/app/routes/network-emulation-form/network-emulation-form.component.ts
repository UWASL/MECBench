import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Checkbox } from '@shared/components/form-inputs/checkbox/checkbox';
import { Textbox } from '@shared/components/form-inputs/textbox/textbox';
import { InputGeneratorService } from '@shared/services/input-generator.service';
import { ConfigurationStoreService } from '@core/configuration/configuration.service';
import { NetworkEmulationConfiguration, MECBenchConfiguration } from '@core/configuration/interface';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-network-emulation-form',
    templateUrl: './network-emulation-form.component.html',
    styleUrls: ['./network-emulation-form.component.scss'],
})
export class NetworkEmulationFormComponent implements OnInit {
    serverNetEm?: NetworkEmulationConfiguration;
    clientNetEm?: NetworkEmulationConfiguration;
    form!: FormGroup;
    enableClientSideEmulation = new Checkbox({
        key: 'enableClientSideTrafficEmulation',
        label: 'configuration.enable-client-side-traffic-emulation'
    });
    clientTcDelay = new Textbox({
        key: 'clientTcDelay',
        label: 'configuration.tc-delay',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-delay-hint',
        },
    });
    clientTcJitter = new Textbox({
        key: 'clientTcJitter',
        label: 'configuration.tc-jitter',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-jitter-hint',
        },
    });
    clientTcBandwidth = new Textbox({
        key: 'clientTcBandwidth',
        label: 'configuration.tc-bandwidth',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-bandwidth-hint',
        },
    });
    clientRandomLoss = new Textbox({
        key: 'clientRandomLoss',
        label: 'configuration.tc-random-loss',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-random-loss-hint',
        },
    });
    enableServerSideEmulation = new Checkbox({
        key: 'enableServerSideEmulation',
        label: 'configuration.enable-server-side-traffic-emulation'
    });
    serverTcDelay = new Textbox({
        key: 'serverTcDelay',
        label: 'configuration.tc-delay',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-delay-hint',
        },
    });
    serverTcJitter = new Textbox({
        key: 'serverTcJitter',
        label: 'configuration.tc-jitter',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-jitter-hint',
        },
    });
    serverTcBandwidth = new Textbox({
        key: 'serverTcBandwidth',
        label: 'configuration.tc-bandwidth',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-bandwidth-hint',
        },
    });
    serverRandomLoss = new Textbox({
        key: 'serverRandomLoss',
        label: 'configuration.tc-random-loss',
        validation: {
            required: true,
        },
        config: {
            hint: 'configuration.tc-random-loss-hint',
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
        this.getNetworkEmulationValues();
    }

    addFormControls(): void {
        this.form = this.inputGeneratorService.generateFromGroup([
            this.enableClientSideEmulation,
            this.clientTcDelay,
            this.clientTcJitter,
            this.clientTcBandwidth,
            this.clientRandomLoss,
            this.enableServerSideEmulation,
            this.serverTcDelay,
            this.serverTcJitter,
            this.serverTcBandwidth,
            this.serverRandomLoss,
        ]);
    }

    getNetworkEmulationValues(): void {
        this.configurationStoreService.configuration$.subscribe((mecbenchConfiguration: MECBenchConfiguration | undefined) => {
            this.clientNetEm = mecbenchConfiguration?.network_client;
            this.serverNetEm = mecbenchConfiguration?.network_server;
            this.form.patchValue({
                enableClientSideTrafficEmulation: this.clientNetEm?.enabled,
                clientTcDelay: this.clientNetEm?.delay,
                clientTcJitter: this.clientNetEm?.jitter,
                clientTcBandwidth: this.clientNetEm?.bandwidth,
                clientRandomLoss: this.clientNetEm?.loss_rate,
                enableServerSideEmulation: this.serverNetEm?.enabled,
                serverTcDelay: this.serverNetEm?.delay,
                serverTcJitter: this.serverNetEm?.jitter,
                serverTcBandwidth: this.serverNetEm?.bandwidth,
                serverRandomLoss: this.serverNetEm?.loss_rate,
            });
        });
    }

    onSave(): void {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.clientNetEm = {
                enabled: this.form.value.enableClientSideTrafficEmulation,
                delay: this.form.value.clientTcDelay,
                jitter: this.form.value.clientTcJitter,
                bandwidth: this.form.value.clientTcBandwidth,
                loss_rate: this.form.value.clientRandomLoss,
            };
            this.serverNetEm = {
                enabled: this.form.value.enableServerSideEmulation,
                delay: this.form.value.serverTcDelay,
                jitter: this.form.value.serverTcJitter,
                bandwidth: this.form.value.serverTcBandwidth,
                loss_rate: this.form.value.serverRandomLoss,
            };
            this.configurationStoreService.setNetworkEmulation(this.serverNetEm, this.clientNetEm);
            this.toastService.success(this.translateService.instant('others.saved'));
        }
    }
}
