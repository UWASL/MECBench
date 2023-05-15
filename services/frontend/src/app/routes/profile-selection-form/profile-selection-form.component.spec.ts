import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSelectionFormComponent } from './profile-selection-form.component';

describe('CloudDeploymentFormComponent', () => {
  let component: ProfileSelectionFormComponent;
  let fixture: ComponentFixture<ProfileSelectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileSelectionFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSelectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
