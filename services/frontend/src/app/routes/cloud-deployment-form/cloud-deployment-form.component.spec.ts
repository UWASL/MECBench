import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudDeploymentFormComponent } from './cloud-deployment-form.component';

describe('CloudDeploymentFormComponent', () => {
  let component: CloudDeploymentFormComponent;
  let fixture: ComponentFixture<CloudDeploymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloudDeploymentFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudDeploymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
