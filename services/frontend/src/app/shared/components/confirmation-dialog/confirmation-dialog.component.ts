import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
    @Input() message = '';

    constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {}

    ngOnInit(): void {}
}
