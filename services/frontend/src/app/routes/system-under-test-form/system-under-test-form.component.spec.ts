import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemUnderTestFormComponent } from './system-under-test-form.component';

describe('SystemUnderTestFormComponent', () => {
  let component: SystemUnderTestFormComponent;
  let fixture: ComponentFixture<SystemUnderTestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemUnderTestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemUnderTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
