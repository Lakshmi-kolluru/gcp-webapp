import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratedDocumentComponent } from './collaborated-document.component';

describe('CollaboratedDocumentComponent', () => {
  let component: CollaboratedDocumentComponent;
  let fixture: ComponentFixture<CollaboratedDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaboratedDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaboratedDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
