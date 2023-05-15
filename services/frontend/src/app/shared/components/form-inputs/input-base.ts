export class InputBase<T> {
    value: T | undefined;
    key: string;
    label: string;
    controlType: string;
    type: string;
    validation: Record<string, any>;
    config: Record<string, any>;
    options: { label: string; value: string }[];

    constructor(
        options: {
            value?: T;
            key?: string;
            label?: string;
            controlType?: string;
            type?: string;
            validation?: Record<string, any>;
            config?: Record<string, any>;
            options?: { label: string; value: string }[];
        } = {}
    ) {
        this.value = options.value;
        this.key = options.key || '';
        this.label = options.label || '';
        this.controlType = options.controlType || '';
        this.type = options.type || '';
        this.options = options.options || [];
        this.validation = options.validation || {};
        this.config = options.config || {};
    }
}
