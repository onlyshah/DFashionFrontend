import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardRbacComponent } from './dashboard-rbac.component';
describe('DashboardRbacComponent', () => {
  let component: DashboardRbacComponent;
  let fixture: ComponentFixture<DashboardRbacComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardRbacComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(DashboardRbacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
