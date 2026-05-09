import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bed } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BedService {
  private apiUrl = 'http://localhost:9085/api/beds';

  constructor(private http: HttpClient) {}

  getAllBeds(): Observable<Bed[]> {
    return this.http.get<Bed[]>(this.apiUrl);
  }

  getBedById(id: number): Observable<Bed> {
    return this.http.get<Bed>(`${this.apiUrl}/${id}`);
  }

  getAvailableBeds(): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.apiUrl}/available`);
  }

  getBedsByStatus(status: string): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.apiUrl}/status/${status}`);
  }

  getBedsByFloor(floor: number): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.apiUrl}/floor/${floor}`);
  }

  createBed(bed: Partial<Bed>): Observable<Bed> {
    return this.http.post<Bed>(this.apiUrl, bed);
  }

  updateBed(id: number, bed: Partial<Bed>): Observable<Bed> {
    return this.http.put<Bed>(`${this.apiUrl}/${id}`, bed);
  }

  updateBedStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status/${status}`, {});
  }

  deleteBed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
