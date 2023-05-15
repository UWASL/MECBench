import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base';

@Component({
    selector: 'app-textbox',
    templateUrl: './textbox.component.html',
    styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnInit {
    @Input() input!: InputBase<string>;
    @Input() form!: FormGroup;

    constructor() {}

    ngOnInit(): void {}
}
