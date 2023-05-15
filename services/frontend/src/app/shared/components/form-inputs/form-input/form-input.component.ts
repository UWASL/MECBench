import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base';

@Component({
    selector: 'app-form-input',
    templateUrl: './form-input.component.html',
    styleUrls: ['./form-input.component.scss'],
})
export class FormInputComponent implements OnInit {
    @Input() form!: FormGroup;
    @Input() input!: InputBase<any>;
    @Output() dropdownValueUpdated = new EventEmitter<any>();
    @Output() checkboxValueUpdated = new EventEmitter<any>();

    constructor() {}

    ngOnInit(): void {}

    onDropdownValueUpdate(): void {
        this.dropdownValueUpdated.emit({ input: this.input, control: this.form.controls[this.input.key] });
    }

    onCheckboxValueUpdate(): void {
        this.checkboxValueUpdated.emit({ input: this.input, control: this.form.controls[this.input.key] });
    }
}
