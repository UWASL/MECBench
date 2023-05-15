import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base';

@Component({
    selector: 'app-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
    @Input() input!: InputBase<string>;
    @Input() form!: FormGroup;
    @Output() valueUpdated = new EventEmitter<any>();

    constructor() {}

    ngOnInit(): void {}
}
