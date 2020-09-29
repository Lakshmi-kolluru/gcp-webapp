import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRegisterationComponent } from './new-registeration.component';

describe('NewRegisterationComponent', () => {
  let component: NewRegisterationComponent;
  let fixture: ComponentFixture<NewRegisterationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewRegisterationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRegisterationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
