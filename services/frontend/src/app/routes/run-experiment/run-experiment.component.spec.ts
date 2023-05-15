import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunExperimentComponent } from './run-experiment.component';

describe('RunExperimentComponent', () => {
  let component: RunExperimentComponent;
  let fixture: ComponentFixture<RunExperimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunExperimentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunExperimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
