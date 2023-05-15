import { InputBase } from '../input-base';

export class Textarea extends InputBase<string> {
  override controlType = 'textarea';
}
