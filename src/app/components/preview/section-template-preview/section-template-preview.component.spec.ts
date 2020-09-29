import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionTemplatePreviewComponent } from './section-template-preview.component';

describe('SectionTemplatePreviewComponent', () => {
  let component: SectionTemplatePreviewComponent;
  let fixture: ComponentFixture<SectionTemplatePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionTemplatePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionTemplatePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
