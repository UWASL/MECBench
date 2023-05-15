import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkEmulationFormComponent } from './network-emulation-form.component';

describe('NetworkEmulationFormComponent', () => {
  let component: NetworkEmulationFormComponent;
  let fixture: ComponentFixture<NetworkEmulationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetworkEmulationFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkEmulationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
