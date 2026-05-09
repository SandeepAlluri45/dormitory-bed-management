import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="customers-page">
      <div class="page-header">
        <div>
          <h1>Customers</h1>
          <p class="subtitle">Manage customer information</p>
        </div>
        <button class="btn btn-primary" (click)="openAddModal()">
          <span class="material-icons">person_add</span>
          Add Customer
        </button>
      </div>

      <!-- Search -->
      <div class="card search-card">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input 
            type="text" 
            placeholder="Search customers by name, email..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()">
        </div>
      </div>

      <!-- Customers Table -->
      <div class="card">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>ID Type</th>
                <th>ID Number</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of filteredCustomers">
                <td><strong>{{ customer.firstName }} {{ customer.lastName }}</strong></td>
                <td>{{ customer.email }}</td>
                <td>{{ customer.phone }}</td>
                <td>{{ customer.idProofType }}</td>
                <td>{{ customer.idProofNumber }}</td>
                <td>{{ customer.address || '-' }}</td>
                <td>
                  <div class="actions">
                    <button class="btn-icon" (click)="openEditModal(customer)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon danger" (click)="deleteCustomer(customer)" title="Delete">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredCustomers.length === 0">
                <td colspan="7" class="no-data">No customers found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}</h2>
            <button class="modal-close" (click)="closeModal()">&times;</button>
          </div>
          
          <form [formGroup]="customerForm" (ngSubmit)="saveCustomer()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input type="text" class="form-control" formControlName="firstName">
                <span class="error-message" *ngIf="hasError('firstName')">First name is required</span>
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input type="text" class="form-control" formControlName="lastName">
                <span class="error-message" *ngIf="hasError('lastName')">Last name is required</span>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" formControlName="email">
                <span class="error-message" *ngIf="hasError('email', 'email')">Please enter a valid email</span>
              </div>
              <div class="form-group">
                <label class="form-label">Phone *</label>
                <input type="tel" class="form-control" formControlName="phone">
                <span class="error-message" *ngIf="hasError('phone')">Phone is required</span>
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
                <span class="error-message" *ngIf="hasError('idProofType')">ID Proof Type is required</span>
              </div>
              <div class="form-group">
                <label class="form-label">ID Number *</label>
                <input type="text" class="form-control" formControlName="idProofNumber">
                <span class="error-message" *ngIf="hasError('idProofNumber')">ID Number is required</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Document (File Upload) *</label>
              <input type="file" class="form-control" formControlName="document">
              <span class="error-message" *ngIf="hasError('document')">Document is required</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea class="form-control" formControlName="address" rows="3"></textarea>
            </div>

         
            
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">{{ editingCustomer ? 'Update' : 'Add' }} Customer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customers-page {
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

    .search-card {
      padding: 16px 24px;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f9fafb;
      padding: 12px 16px;
      border-radius: 8px;
      max-width: 400px;
    }

    .search-box .material-icons {
      color: #9ca3af;
    }

    .search-box input {
      flex: 1;
      border: none;
      background: none;
      font-size: 14px;
      outline: none;
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

    textarea.form-control {
      resize: vertical;
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
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchQuery = '';
  
  showModal = false;
  customerFormSubmitted = false;
  editingCustomer: Customer | null = null;
  customerForm: FormGroup;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.customerForm = this.createForm();
  }

  createForm(): FormGroup {
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

  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.customerForm.get(fieldName);
    if (!field) return false;
    
    // Show error if form is submitted OR field is touched/dirty
    const shouldShowError = this.customerFormSubmitted || field.dirty || field.touched;
    
    if (errorType) {
      return field.hasError(errorType) && shouldShowError;
    }
    
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

  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (!field) return '';
    
    if (field.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email';
    }
    return 'Invalid input';
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.filteredCustomers = customers;
      },
      error: (err) => console.error('Error loading customers:', err)
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredCustomers = this.customers;
      return;
    }
    
    this.filteredCustomers = this.customers.filter(c => 
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    );
  }

  openAddModal(): void {
    this.editingCustomer = null;
    this.customerForm = this.createForm();
    this.customerFormSubmitted = false;
    this.showModal = true;
  }

  openEditModal(customer: Customer): void {
    this.editingCustomer = customer;
    this.customerForm = this.createForm();
    this.customerFormSubmitted = false;
    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      idProofType: customer.idProofType,
      idProofNumber: customer.idProofNumber,
      address: customer.address
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCustomer = null;
    this.customerForm = this.createForm();
    this.customerFormSubmitted = false;
  }

  saveCustomer(): void {
    // Mark all fields as touched and dirty immediately
    this.markFormGroupTouched(this.customerForm);
    this.customerFormSubmitted = true;
    
    // Stop if form is invalid
    if (!this.customerForm.valid) {
      return;
    }

    if (this.editingCustomer) {
      this.customerService.updateCustomer(this.editingCustomer.id, this.customerForm.value).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error updating customer:', err)
      });
    } else {
      this.customerService.createCustomer(this.customerForm.value).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error creating customer:', err)
      });
    }
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => this.loadCustomers(),
        error: (err) => console.error('Error deleting customer:', err)
      });
    }
  }
}
