import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { BedService } from '../../services/bed.service';
import { DashboardStats, Bed } from '../../models/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Overview of dormitory bed management</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <span class="material-icons">bed</span>
          </div>
          <div class="stat-info">
            <h3>Total Beds</h3>
            <p class="stat-value">{{ stats?.totalBeds || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon idle">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="stat-info">
            <h3>Available</h3>
            <p class="stat-value idle">{{ stats?.idleBeds || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon allocated">
            <span class="material-icons">person</span>
          </div>
          <div class="stat-info">
            <h3>Occupied</h3>
            <p class="stat-value allocated">{{ stats?.allocatedBeds || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon maintenance">
            <span class="material-icons">build</span>
          </div>
          <div class="stat-info">
            <h3>Maintenance</h3>
            <p class="stat-value maintenance">{{ stats?.maintenanceBeds || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Revenue & Occupancy -->
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>Occupancy Rate</h3>
          <div class="occupancy-circle">
            <svg viewBox="0 0 36 36">
              <path
                class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle-progress"
                [attr.stroke-dasharray]="(stats?.occupancyRate || 0) + ', 100'"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span class="occupancy-text">{{ stats?.occupancyRate || 0 }}%</span>
          </div>
        </div>

        <div class="metric-card">
          <h3>Today's Revenue</h3>
          <p class="revenue-value">₹{{ stats?.todayRevenue?.toFixed(2) || '0.00' }}</p>
        </div>

        <div class="metric-card">
          <h3>Monthly Revenue</h3>
          <p class="revenue-value">₹{{ stats?.monthRevenue?.toFixed(2) || '0.00' }}</p>
        </div>
      </div>

      <!-- Bed Status Visual -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Bed Status Overview</h2>
          <div class="legend">
            <span class="legend-item">
              <span class="legend-color idle"></span> Available
            </span>
            <span class="legend-item">
              <span class="legend-color allocated"></span> Occupied
            </span>
            <span class="legend-item">
              <span class="legend-color maintenance"></span> Maintenance
            </span>
          </div>
        </div>
        
        <div class="floors-container">
          <div *ngFor="let floor of getFloors()" class="floor-section">
            <h3 class="floor-title">Floor {{ floor }}</h3>
            <div class="beds-grid">
              <div 
                *ngFor="let bed of getBedsByFloor(floor)" 
                class="bed-card"
                [ngClass]="'bed-' + bed.status.toLowerCase()"
                (click)="onBedClick(bed)">
                <span class="bed-number">{{ bed.bedNumber }}</span>
                <span class="bed-room">{{ bed.roomNumber }}</span>
                <span class="bed-type">{{ bed.bedType }}</span>
                <span *ngIf="bed.customerName" class="customer-name">
                  {{ bed.customerName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.3s ease;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
    }

    .subtitle {
      color: #6b7280;
      margin-top: 5px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon .material-icons {
      font-size: 28px;
      color: white;
    }

    .stat-icon.total { background: linear-gradient(135deg, #667eea, #764ba2); }
    .stat-icon.idle { background: linear-gradient(135deg, #10b981, #059669); }
    .stat-icon.allocated { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .stat-icon.maintenance { background: linear-gradient(135deg, #f59e0b, #d97706); }

    .stat-info h3 {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-value.idle { color: #10b981; }
    .stat-value.allocated { color: #ef4444; }
    .stat-value.maintenance { color: #f59e0b; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    @media (max-width: 900px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .metric-card h3 {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
    }

    .occupancy-circle {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }

    .occupancy-circle svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .circle-bg {
      fill: none;
      stroke: #e5e7eb;
      stroke-width: 3;
    }

    .circle-progress {
      fill: none;
      stroke: #3b82f6;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.5s ease;
    }

    .occupancy-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .revenue-value {
      font-size: 2rem;
      font-weight: 700;
      color: #10b981;
    }

    .legend {
      display: flex;
      gap: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-color.idle { background: #10b981; }
    .legend-color.allocated { background: #ef4444; }
    .legend-color.maintenance { background: #f59e0b; }

    .floors-container {
      margin-top: 20px;
    }

    .floor-section {
      margin-bottom: 30px;
    }

    .floor-title {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .beds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .bed-card {
      padding: 16px;
      border-radius: 10px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .bed-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .bed-idle {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2));
      border-color: #10b981;
    }

    .bed-allocated {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
      border-color: #ef4444;
    }

    .bed-maintenance {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2));
      border-color: #f59e0b;
    }

    .bed-number {
      display: block;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f2937;
    }

    .bed-room {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .bed-type {
      display: block;
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }

    .customer-name {
      display: block;
      font-size: 11px;
      color: #ef4444;
      font-weight: 500;
      margin-top: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  beds: Bed[] = [];
  private refreshSubscription?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private bedService: BedService
  ) {}

  ngOnInit(): void {
    this.loadData();
    // Refresh data every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadData(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Error loading dashboard stats:', err)
    });

    this.bedService.getAllBeds().subscribe({
      next: (beds) => this.beds = beds,
      error: (err) => console.error('Error loading beds:', err)
    });
  }

  getFloors(): number[] {
    const floors = [...new Set(this.beds.map(b => b.floorNumber))];
    return floors.sort((a, b) => a - b);
  }

  getBedsByFloor(floor: number): Bed[] {
    return this.beds.filter(b => b.floorNumber === floor);
  }

  onBedClick(bed: Bed): void {
    console.log('Bed clicked:', bed);
    // Could open a modal with bed details
  }
}
