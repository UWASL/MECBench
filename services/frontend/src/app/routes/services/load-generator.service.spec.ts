import { TestBed } from '@angular/core/testing';

import { LoadGeneratorService } from './load-generator.service';

describe('LoadGeneratorService', () => {
  let service: LoadGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
