import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentResultsComponent } from './experiment-results.component';

describe('ExperimentResultsComponent', () => {
  let component: ExperimentResultsComponent;
  let fixture: ComponentFixture<ExperimentResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
