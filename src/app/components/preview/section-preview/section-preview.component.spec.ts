import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionPreviewComponent } from './section-preview.component';

describe('SectionPreviewComponent', () => {
  let component: SectionPreviewComponent;
  let fixture: ComponentFixture<SectionPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
