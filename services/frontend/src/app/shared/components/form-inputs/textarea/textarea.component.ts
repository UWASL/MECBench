import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base';

@Component({
    selector: 'app-textarea',
    templateUrl: './textarea.component.html',
    styleUrls: ['./textarea.component.scss'],
})
export class TextareaComponent implements OnInit {
    @Input() input!: InputBase<string>;
    @Input() form!: FormGroup;

    constructor() {}

    ngOnInit(): void {}
}
