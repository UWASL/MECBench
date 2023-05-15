import { InputBase } from '../input-base';

export class Checkbox extends InputBase<boolean> {
  override controlType = 'checkbox';
}
