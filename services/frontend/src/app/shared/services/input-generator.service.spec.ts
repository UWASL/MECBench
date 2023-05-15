import { TestBed } from '@angular/core/testing';

import { InputGeneratorService } from './input-generator.service';

describe('InputGeneratorService', () => {
  let service: InputGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
