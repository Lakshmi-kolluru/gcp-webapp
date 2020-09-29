import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedTemplatesComponent } from './shared-templates.component';

describe('SharedTemplatesComponent', () => {
  let component: SharedTemplatesComponent;
  let fixture: ComponentFixture<SharedTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
