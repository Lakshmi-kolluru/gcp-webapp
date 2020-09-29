import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSectionsComponent } from './new-sections.component';

describe('NewSectionsComponent', () => {
  let component: NewSectionsComponent;
  let fixture: ComponentFixture<NewSectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewSectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
