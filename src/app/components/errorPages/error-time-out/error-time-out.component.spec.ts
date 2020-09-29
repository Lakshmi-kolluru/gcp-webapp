import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorTimeOutComponent } from './error-time-out.component';

describe('ErrorTimeOutComponent', () => {
  let component: ErrorTimeOutComponent;
  let fixture: ComponentFixture<ErrorTimeOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorTimeOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorTimeOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
