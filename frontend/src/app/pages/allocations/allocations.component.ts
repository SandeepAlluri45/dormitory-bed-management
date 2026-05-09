import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AllocationService } from '../../services/allocation.service';
import { BedService } from '../../services/bed.service';
import { CustomerService } from '../../services/customer.service';
import { Allocation, AllocationRequest, Bed, Customer } from '../../models/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-allocations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="allocations-page">
      <div class="page-header">
        <div>
          <h1>Bed Allocations</h1>
          <p class="subtitle">Manage bed assignments and checkouts</p>
        </div>
        <button class="btn btn-primary" (click)="openAllocateModal()">
          <span class="material-icons">add_box</span>
          Allocate Bed
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab === 'active'" 
          (click)="activeTab = 'active'; loadAllocations()">
          Active Allocations
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'completed'" 
          (click)="activeTab = 'completed'; loadAllocations()">
          History
        </button>
      </div>

      <!-- Active Allocations -->
      <div class="card" *ngIf="activeTab === 'active'">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Bed</th>
                <th>Room</th>
                <th>Customer</th>
                <th>Check In</th>
                <th>Duration</th>
                <th>Current Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let allocation of activeAllocations">
                <td><strong>{{ allocation.bedNumber }}</strong></td>
                <td>{{ allocation.roomNumber }}</td>
                <td>{{ allocation.customerName }}</td>
                <td>{{ formatDate(allocation.checkInTime) }}</td>
                <td>{{ getDuration(allocation.checkInTime) }}</td>
                <td class="cost">₹{{ allocation.currentCost?.toFixed(2) || '0.00' }}</td>
                <td>
                  <span class="badge badge-active">Active</span>
                </td>
                <td>
                  <button class="btn btn-success btn-sm" (click)="checkOut(allocation)">
                    <span class="material-icons">logout</span>
                    Check Out
                  </button>
                </td>
              </tr>
              <tr *ngIf="activeAllocations.length === 0">
                <td colspan="8" class="no-data">No active allocations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Completed Allocations -->
      <div class="card" *ngIf="activeTab === 'completed'">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Bed</th>
                <th>Room</th>
                <th>Customer</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Total Cost</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let allocation of completedAllocations">
                <td><strong>{{ allocation.bedNumber }}</strong></td>
                <td>{{ allocation.roomNumber }}</td>
                <td>{{ allocation.customerName }}</td>
                <td>{{ formatDate(allocation.checkInTime) }}</td>
                <td>{{ formatDate(allocation.checkOutTime) }}</td>
                <td>{{ allocation.totalHours?.toFixed(2) || '-' }} hrs</td>
                <td class="cost">₹{{ allocation.totalCost?.toFixed(2) || '0.00' }}</td>
                <td>
                  <span class="badge badge-idle">{{ allocation.paymentStatus }}</span>
                </td>
              </tr>
              <tr *ngIf="completedAllocations.length === 0">
                <td colspan="8" class="no-data">No completed allocations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Allocate Modal -->
      <div class="modal-overlay" *ngIf="showAllocateModal" (click)="closeAllocateModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Allocate Bed</h2>
            <button class="modal-close" (click)="closeAllocateModal()">&times;</button>
          </div>
          
          <form [formGroup]="allocateFormGroup" (ngSubmit)="allocateBed()">
            <div class="form-group">
              <label class="form-label">Select Available Bed *</label>
              <select class="form-control" formControlName="bedId">
                <option value="">Choose a bed...</option>
                <option *ngFor="let bed of availableBeds" [value]="bed.id">
                  {{ bed.bedNumber }} - {{ bed.roomNumber }} (Floor {{ bed.floorNumber }}) - ₹{{ bed.hourlyRate }}/hr
                </option>
              </select>
              <span class="error-message" *ngIf="hasError('bedId', 'allocate')">Please select a bed</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Select Customer *</label>
              <select class="form-control" formControlName="customerId">
                <option value="">Choose a customer...</option>
                <option *ngFor="let customer of customers" [value]="customer.id">
                  {{ customer.firstName }} {{ customer.lastName }} - {{ customer.phone }}
                </option>
              </select>
              <span class="error-message" *ngIf="hasError('customerId', 'allocate')">Please select a customer</span>
              <button type="button" class="btn btn-outline btn-sm mt-2" (click)="openAddCustomerModal()">
                + Add New Customer
              </button>
            </div>
            
            <div class="form-group">
              <label class="form-label">Expected Checkout</label>
              <input 
                type="datetime-local" 
                class="form-control" 
                formControlName="expectedCheckout">
            </div>
            
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea 
                class="form-control" 
                formControlName="notes" 
                rows="2"
                placeholder="Any special requirements..."></textarea>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeAllocateModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Allocate Bed</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Customer Modal (inside Allocate Bed) -->
      <div class="modal-overlay" *ngIf="showAddCustomerModal" (click)="closeAddCustomerModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Add New Customer</h2>
            <button class="modal-close" (click)="closeAddCustomerModal()">&times;</button>
          </div>
          
          <form [formGroup]="newCustomerFormGroup" (ngSubmit)="saveNewCustomer()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input type="text" class="form-control" formControlName="firstName">
                <span class="error-message" *ngIf="hasError('firstName', 'customer')">First name is required</span>
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input type="text" class="form-control" formControlName="lastName">
                <span class="error-message" *ngIf="hasError('lastName', 'customer')">Last name is required</span>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email">
                <span class="error-message" *ngIf="hasError('email', 'customer')">Please enter a valid email</span>
              </div>
              <div class="form-group">
                <label class="form-label">Phone *</label>
                <input type="tel" class="form-control" formControlName="phone">
                <span class="error-message" *ngIf="hasError('phone', 'customer')">Phone is required</span>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">ID Proof Type *</label>
                <select class="form-control" formControlName="idProofType">
                  <option value="">Select Type</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVER_LICENSE">Driver's License</option>
                  <option value="NATIONAL_ID">National ID</option>
                  <option value="OTHER">Other</option>
                </select>
                <span class="error-message" *ngIf="hasError('idProofType', 'customer')">ID Proof Type is required</span>
              </div>
              <div class="form-group">
                <label class="form-label">ID Number *</label>
                <input type="text" class="form-control" formControlName="idProofNumber">
                <span class="error-message" *ngIf="hasError('idProofNumber', 'customer')">ID Number is required</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Document (File Upload) *</label>
              <input type="file" class="form-control" formControlName="document">
              <span class="error-message" *ngIf="hasError('document', 'customer')">Document is required</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea class="form-control" formControlName="address" rows="3"></textarea>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeAddCustomerModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Customer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Checkout Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showCheckoutModal" (click)="closeCheckoutModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Confirm Checkout</h2>
            <button class="modal-close" (click)="closeCheckoutModal()">&times;</button>
          </div>
          
          <div class="checkout-details" *ngIf="selectedAllocation">
            <div class="detail-row">
              <span class="label">Bed:</span>
              <span class="value">{{ selectedAllocation.bedNumber }} ({{ selectedAllocation.roomNumber }})</span>
            </div>
            <div class="detail-row">
              <span class="label">Customer:</span>
              <span class="value">{{ selectedAllocation.customerName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check In:</span>
              <span class="value">{{ formatDate(selectedAllocation.checkInTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">{{ getDuration(selectedAllocation.checkInTime) }}</span>
            </div>
            <div class="detail-row total">
              <span class="label">Estimated Cost:</span>
              <span class="value">₹{{ selectedAllocation.currentCost?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closeCheckoutModal()">Cancel</button>
            <button type="button" class="btn btn-success" (click)="confirmCheckout()">
              <span class="material-icons">check</span>
              Confirm Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .allocations-page {
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

    .tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      background: white;
      padding: 4px;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      width: fit-content;
    }

    .tab {
      padding: 10px 24px;
      border: none;
      background: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab:hover {
      color: #1f2937;
    }

    .tab.active {
      background: #3b82f6;
      color: white;
    }

    .cost {
      font-weight: 600;
      color: #10b981;
    }

    .badge-active {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 13px;
    }

    .mt-2 {
      margin-top: 8px;
    }

    .no-data {
      text-align: center;
      color: #9ca3af;
      padding: 40px !important;
    }

    .checkout-details {
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-row.total {
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
      border-bottom: none;
    }

    .detail-row .label {
      color: #6b7280;
    }

    .detail-row .value {
      font-weight: 600;
      color: #1f2937;
    }

    .detail-row.total .value {
      font-size: 1.2rem;
      color: #10b981;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    textarea.form-control {
      resize: vertical;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 28px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #6b7280;
    }

    .modal form {
      padding: 24px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-outline {
      background: white;
      border: 1px solid #d1d5db;
      color: #374151;
    }

    .btn-outline:hover {
      background: #f9fafb;
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 13px;
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
export class AllocationsComponent implements OnInit, OnDestroy {
  activeTab: 'active' | 'completed' = 'active';
  activeAllocations: Allocation[] = [];
  completedAllocations: Allocation[] = [];
  availableBeds: Bed[] = [];
  customers: Customer[] = [];
  
  showAllocateModal = false;
  showCheckoutModal = false;
  showAddCustomerModal = false;
  allocateFormSubmitted = false;
  customerFormSubmitted = false;
  selectedAllocation: Allocation | null = null;
  
  allocateFormGroup: FormGroup;
  newCustomerFormGroup: FormGroup;
  
  private refreshSubscription?: Subscription;

  constructor(
    private allocationService: AllocationService,
    private bedService: BedService,
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.allocateFormGroup = this.createAllocateForm();
    this.newCustomerFormGroup = this.createCustomerForm();
  }

  createAllocateForm(): FormGroup {
    return this.fb.group({
      bedId: ['', Validators.required],
      customerId: ['', Validators.required],
      expectedCheckout: [''],
      notes: ['']
    });
  }

  createCustomerForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: ['', Validators.required],
      idProofType: ['', Validators.required],
      idProofNumber: ['', Validators.required],
      address: [''],
      document: ['', Validators.required]
    });
  }

  hasError(fieldName: string, formType?: string): boolean {
    const form = formType === 'customer' ? this.newCustomerFormGroup : this.allocateFormGroup;
    const submitted = formType === 'customer' ? this.customerFormSubmitted : this.allocateFormSubmitted;
    const field = form.get(fieldName);
    if (!field) return false;
    
    // Show error if form is submitted OR field is touched/dirty
    const shouldShowError = submitted || field.dirty || field.touched;
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
    this.loadAllocations();
    this.loadAvailableBeds();
    this.loadCustomers();
    
    // Refresh active allocations every minute to update costs
    this.refreshSubscription = interval(60000).subscribe(() => {
      if (this.activeTab === 'active') {
        this.loadAllocations();
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadAllocations(): void {
    if (this.activeTab === 'active') {
      this.allocationService.getActiveAllocations().subscribe({
        next: (allocations) => this.activeAllocations = allocations,
        error: (err) => console.error('Error loading active allocations:', err)
      });
    } else {
      this.allocationService.getCompletedAllocations().subscribe({
        next: (allocations) => this.completedAllocations = allocations,
        error: (err) => console.error('Error loading completed allocations:', err)
      });
    }
  }

  loadAvailableBeds(): void {
    this.bedService.getAvailableBeds().subscribe({
      next: (beds) => this.availableBeds = beds,
      error: (err) => console.error('Error loading available beds:', err)
    });
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => this.customers = customers,
      error: (err) => console.error('Error loading customers:', err)
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(checkInStr: string): string {
    const checkIn = new Date(checkInStr);
    const now = new Date();
    const diffMs = now.getTime() - checkIn.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days}d ${hours}h`;
    }
    return `${diffHours}h ${diffMins}m`;
  }

  openAllocateModal(): void {
    this.allocateFormGroup = this.createAllocateForm();
    this.allocateFormSubmitted = false;
    this.loadAvailableBeds();
    this.loadCustomers();
    this.showAllocateModal = true;
  }

  closeAllocateModal(): void {
    this.showAllocateModal = false;
    this.allocateFormGroup = this.createAllocateForm();
    this.allocateFormSubmitted = false;
  }

  allocateBed(): void {
    // Mark all fields as touched and dirty immediately
    this.markFormGroupTouched(this.allocateFormGroup);
    this.allocateFormSubmitted = true;
    
    // Stop if form is invalid
    if (!this.allocateFormGroup.valid) {
      return;
    }

    const request: AllocationRequest = {
      bedId: +this.allocateFormGroup.get('bedId')?.value,
      customerId: +this.allocateFormGroup.get('customerId')?.value,
      expectedCheckout: this.allocateFormGroup.get('expectedCheckout')?.value || undefined,
      notes: this.allocateFormGroup.get('notes')?.value || undefined
    };

    this.allocationService.allocateBed(request).subscribe({
      next: () => {
        this.loadAllocations();
        this.loadAvailableBeds();
        this.closeAllocateModal();
      },
      error: (err) => {
        console.error('Error allocating bed:', err);
        alert('Error allocating bed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  checkOut(allocation: Allocation): void {
    this.selectedAllocation = allocation;
    this.showCheckoutModal = true;
  }

  closeCheckoutModal(): void {
    this.showCheckoutModal = false;
    this.selectedAllocation = null;
  }

  confirmCheckout(): void {
    if (!this.selectedAllocation) return;

    this.allocationService.checkOut(this.selectedAllocation.id).subscribe({
      next: (result) => {
        alert(`Checkout complete! Total cost: $${result.totalCost?.toFixed(2)}`);
        this.loadAllocations();
        this.loadAvailableBeds();
        this.closeCheckoutModal();
      },
      error: (err) => {
        console.error('Error during checkout:', err);
        alert('Error during checkout: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  openAddCustomerModal(): void {
    this.newCustomerFormGroup = this.createCustomerForm();
    this.customerFormSubmitted = false;
    this.showAddCustomerModal = true;
  }

  closeAddCustomerModal(): void {
    this.showAddCustomerModal = false;
    this.newCustomerFormGroup = this.createCustomerForm();
    this.customerFormSubmitted = false;
  }

  saveNewCustomer(): void {
    // Mark all fields as touched and dirty immediately
    this.markFormGroupTouched(this.newCustomerFormGroup);
    this.customerFormSubmitted = true;
    
    // Stop if form is invalid
    if (!this.newCustomerFormGroup.valid) {
      return;
    }

    this.customerService.createCustomer(this.newCustomerFormGroup.value).subscribe({
      next: (newCustomer: Customer) => {
        this.loadCustomers();
        // Auto-select the newly created customer
        this.allocateFormGroup.patchValue({ customerId: newCustomer.id });
        this.closeAddCustomerModal();
      },
      error: (err) => {
        console.error('Error creating customer:', err);
        alert('Error creating customer: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
