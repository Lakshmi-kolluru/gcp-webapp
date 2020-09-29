import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTemplatePreviewComponent } from './document-template-preview.component';

describe('DocumentTemplatePreviewComponent', () => {
  let component: DocumentTemplatePreviewComponent;
  let fixture: ComponentFixture<DocumentTemplatePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTemplatePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTemplatePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
