import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualSearchComponent } from './visual-search.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

describe('VisualSearchComponent', () => {
  let component: VisualSearchComponent;
  let fixture: ComponentFixture<VisualSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule, CommonModule],
      declarations: [VisualSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
