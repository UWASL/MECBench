import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadGeneratorFormComponent } from './load-generator-form.component';

describe('LoadGeneratorFormComponent', () => {
  let component: LoadGeneratorFormComponent;
  let fixture: ComponentFixture<LoadGeneratorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadGeneratorFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadGeneratorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
