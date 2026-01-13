import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardVendorComponent } from './dashboard-vendor.component';
describe('DashboardVendorComponent', () => {
  let component: DashboardVendorComponent;
  let fixture: ComponentFixture<DashboardVendorComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardVendorComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(DashboardVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
