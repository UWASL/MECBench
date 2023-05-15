import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base';

@Component({
    selector: 'app-checkbox',
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent implements OnInit {
    @Input() input!: InputBase<boolean>;
    @Input() form!: FormGroup;
    @Output() valueUpdated = new EventEmitter<any>();

    constructor() {}

    ngOnInit(): void {}
}
