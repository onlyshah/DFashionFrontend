import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardInfluencerComponent } from './dashboard-influencer.component';
describe('DashboardInfluencerComponent', () => {
  let component: DashboardInfluencerComponent;
  let fixture: ComponentFixture<DashboardInfluencerComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardInfluencerComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(DashboardInfluencerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
