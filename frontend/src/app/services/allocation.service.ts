import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allocation, AllocationRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AllocationService {
  private apiUrl = 'http://localhost:9085/api/allocations';

  constructor(private http: HttpClient) {}

  getAllAllocations(): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(this.apiUrl);
  }

  getActiveAllocations(): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(`${this.apiUrl}/active`);
  }

  getCompletedAllocations(): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(`${this.apiUrl}/completed`);
  }

  getAllocationById(id: number): Observable<Allocation> {
    return this.http.get<Allocation>(`${this.apiUrl}/${id}`);
  }

  getActiveAllocationByBedId(bedId: number): Observable<Allocation> {
    return this.http.get<Allocation>(`${this.apiUrl}/bed/${bedId}`);
  }

  getAllocationsByCustomerId(customerId: number): Observable<Allocation[]> {
    return this.http.get<Allocation[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  allocateBed(request: AllocationRequest): Observable<Allocation> {
    return this.http.post<Allocation>(`${this.apiUrl}/allocate`, request);
  }

  checkOut(allocationId: number): Observable<Allocation> {
    return this.http.post<Allocation>(`${this.apiUrl}/${allocationId}/checkout`, {});
  }

  deleteAllocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
