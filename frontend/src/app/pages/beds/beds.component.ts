import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { BedService } from '../../services/bed.service';
import { Bed } from '../../models/models';

@Component({
  selector: 'app-beds',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="beds-page">
      <div class="page-header">
        <div>
          <h1>Beds Management</h1>
          <p class="subtitle">Manage dormitory beds and their status</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <span class="material-icons">add</span>
          Add New Bed
        </button>
      </div>

      <!-- Filters -->
      <div class="filters card">
        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="filterStatus" (change)="applyFilters()">
            <option value="">All</option>
            <option value="IDLE">Available</option>
            <option value="ALLOCATED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Floor:</label>
          <select [(ngModel)]="filterFloor" (change)="applyFilters()">
            <option value="">All Floors</option>
            <option *ngFor="let floor of floors" [value]="floor">Floor {{ floor }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Type:</label>
          <select [(ngModel)]="filterType" (change)="applyFilters()">
            <option value="">All Types</option>
            <option value="STANDARD">Standard</option>
            <option value="PREMIUM">Premium</option>
            <option value="DELUXE">Deluxe</option>
          </select>
        </div>
      </div>

      <!-- Beds Table -->
      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Bed #</th>
                <th>Room</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Hourly Rate</th>
                <th>Daily Rate</th>
                <th>Customer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bed of filteredBeds">
                <td><strong>{{ bed.bedNumber }}</strong></td>
                <td>{{ bed.roomNumber }}</td>
                <td>{{ bed.floorNumber }}</td>
                <td>{{ bed.bedType }}</td>
                <td>
                  <span class="badge" [ngClass]="'badge-' + bed.status.toLowerCase()">
                    {{ bed.status }}
                  </span>
                </td>
                <td>₹{{ bed.hourlyRate.toFixed(2) }}</td>
                <td>₹{{ bed.dailyRate.toFixed(2) }}</td>
                <td>{{ bed.customerName || '-' }}</td>
                <td>
                  <div class="actions">
                    <button class="btn-icon" (click)="openEditModal(bed)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button 
                      class="btn-icon" 
                      *ngIf="bed.status === 'IDLE'"
                      (click)="setMaintenance(bed)"
                      title="Set Maintenance">
                      <span class="material-icons">build</span>
                    </button>
                    <button 
                      class="btn-icon"
                      *ngIf="bed.status === 'MAINTENANCE'"
                      (click)="setAvailable(bed)"
                      title="Set Available">
                      <span class="material-icons">check</span>
                    </button>
                    <button 
                      class="btn-icon danger" 
                      *ngIf="bed.status !== 'ALLOCATED'"
                      (click)="deleteBed(bed)"
                      title="Delete">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredBeds.length === 0">
                <td colspan="9" class="no-data">No beds found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingBed ? 'Edit Bed' : 'Add New Bed' }}</h2>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          
          <form [formGroup]="bedForm" (ngSubmit)="saveBed()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Bed Number *</label>
                <input type="text" class="form-control" formControlName="bedNumber">
                <span class="error-message" *ngIf="hasError('bedNumber')">Bed number is required</span>
              </div>
              <div class="form-group">
                <label class="form-label">Room Number *</label>
                <input type="text" class="form-control" formControlName="roomNumber">
                <span class="error-message" *ngIf="hasError('roomNumber')">Room number is required</span>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Floor *</label>
                <input type="number" class="form-control" formControlName="floorNumber" min="1">
                <span class="error-message" *ngIf="hasError('floorNumber')">Floor is required</span>
              </div>
              <div class="form-group">
                <label class="form-label">Bed Type</label>
                <select class="form-control" formControlName="bedType" (change)="onBedTypeChange()">
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="DELUXE">Deluxe</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Hourly Rate (₹)</label>
                <input type="number" class="form-control" formControlName="hourlyRate" step="0.01" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Daily Rate (₹)</label>
                <input type="number" class="form-control" formControlName="dailyRate" step="0.01" min="0">
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">{{ editingBed ? 'Update' : 'Add' }} Bed</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .beds-page {
      animation: fadeIn 0.3s ease;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .filters {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      padding: 16px 24px;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filter-group label {
      font-size: 14px;
      color: #6b7280;
    }

    .filter-group select {
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 6px;
      border-radius: 6px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #f3f4f6;
      color: #3b82f6;
    }

    .btn-icon.danger:hover {
      background: #fef2f2;
      color: #ef4444;
    }

    .btn-icon .material-icons {
      font-size: 20px;
    }

    .no-data {
      text-align: center;
      color: #9ca3af;
      padding: 40px !important;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BedsComponent implements OnInit {
  beds: Bed[] = [];
  filteredBeds: Bed[] = [];
  floors: number[] = [];
  
  filterStatus = '';
  filterFloor = '';
  filterType = '';
  
  showModal = false;
  bedFormSubmitted = false;
  editingBed: Bed | null = null;
  bedForm: FormGroup;

  constructor(
    private bedService: BedService,
    private fb: FormBuilder
  ) {
    this.bedForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      bedNumber: ['', Validators.required],
      roomNumber: ['', Validators.required],
      floorNumber: [1, [Validators.required, Validators.min(1)]],
      bedType: ['STANDARD'],
      hourlyRate: [100.00, [Validators.min(0)]],
      dailyRate: [900.00, [Validators.min(0)]]
    });
  }

  onBedTypeChange(): void {
    const bedType = this.bedForm.get('bedType')?.value;
    switch (bedType) {
      case 'PREMIUM':
        this.bedForm.patchValue({
          hourlyRate: 150.00,
          dailyRate: 12000.00
        });
        break;
      case 'DELUXE':
        this.bedForm.patchValue({
          hourlyRate: 200.00,
          dailyRate: 15000.00
        });
        break;
      default: // STANDARD
        this.bedForm.patchValue({
          hourlyRate: 100.00,
          dailyRate: 900.00
        });
    }
  }

  hasError(fieldName: string): boolean {
    const field = this.bedForm.get(fieldName);
    if (!field) return false;
    
    // Show error if form is submitted OR field is touched/dirty
    const shouldShowError = this.bedFormSubmitted || field.dirty || field.touched;
    return field.invalid && shouldShowError;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
      control?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadBeds();
  }

  loadBeds(): void {
    this.bedService.getAllBeds().subscribe({
      next: (beds) => {
        this.beds = beds;
        this.floors = [...new Set(beds.map(b => b.floorNumber))].sort((a, b) => a - b);
        this.applyFilters();
      },
      error: (err) => console.error('Error loading beds:', err)
    });
  }

  applyFilters(): void {
    this.filteredBeds = this.beds.filter(bed => {
      if (this.filterStatus && bed.status !== this.filterStatus) return false;
      if (this.filterFloor && bed.floorNumber !== +this.filterFloor) return false;
      if (this.filterType && bed.bedType !== this.filterType) return false;
      return true;
    });
  }

  openAddModal(): void {
    this.editingBed = null;
    this.bedForm = this.createForm();
    this.bedFormSubmitted = false;
    this.showModal = true;
  }

  openEditModal(bed: Bed): void {
    this.editingBed = bed;
    this.bedForm = this.createForm();
    this.bedFormSubmitted = false;
    this.bedForm.patchValue({
      bedNumber: bed.bedNumber,
      roomNumber: bed.roomNumber,
      floorNumber: bed.floorNumber,
      bedType: bed.bedType,
      hourlyRate: bed.hourlyRate,
      dailyRate: bed.dailyRate
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingBed = null;
    this.bedForm = this.createForm();
    this.bedFormSubmitted = false;
  }

  saveBed(): void {
    // Mark all fields as touched and dirty immediately
    this.markFormGroupTouched(this.bedForm);
    this.bedFormSubmitted = true;
    
    // Stop if form is invalid
    if (!this.bedForm.valid) {
      return;
    }

    if (this.editingBed) {
      this.bedService.updateBed(this.editingBed.id, this.bedForm.value).subscribe({
        next: () => {
          this.loadBeds();
          this.closeModal();
        },
        error: (err) => console.error('Error updating bed:', err)
      });
    } else {
      this.bedService.createBed(this.bedForm.value).subscribe({
        next: () => {
          this.loadBeds();
          this.closeModal();
        },
        error: (err) => console.error('Error creating bed:', err)
      });
    }
  }

  setMaintenance(bed: Bed): void {
    this.bedService.updateBedStatus(bed.id, 'MAINTENANCE').subscribe({
      next: () => this.loadBeds(),
      error: (err) => console.error('Error updating status:', err)
    });
  }

  setAvailable(bed: Bed): void {
    this.bedService.updateBedStatus(bed.id, 'IDLE').subscribe({
      next: () => this.loadBeds(),
      error: (err) => console.error('Error updating status:', err)
    });
  }

  deleteBed(bed: Bed): void {
    if (confirm(`Are you sure you want to delete bed ${bed.bedNumber}?`)) {
      this.bedService.deleteBed(bed.id).subscribe({
        next: () => this.loadBeds(),
        error: (err) => console.error('Error deleting bed:', err)
      });
    }
  }
}
