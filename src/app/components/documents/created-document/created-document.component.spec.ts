import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatedDocumentComponent } from './created-document.component';

describe('CreatedDocumentComponent', () => {
  let component: CreatedDocumentComponent;
  let fixture: ComponentFixture<CreatedDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatedDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatedDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
