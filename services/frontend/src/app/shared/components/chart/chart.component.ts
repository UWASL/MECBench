import { Component, Input, OnInit } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
    @Input() chartOptions!: Partial<ApexOptions>;
    @Input() colors: string[]= [];

    constructor() {}

    ngOnInit(): void {}
}
