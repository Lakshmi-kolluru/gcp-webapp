import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedTemplatesComponent } from './created-templates.component';

describe('CreatedTemplatesComponent', () => {
  let component: CreatedTemplatesComponent;
  let fixture: ComponentFixture<CreatedTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatedTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatedTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
