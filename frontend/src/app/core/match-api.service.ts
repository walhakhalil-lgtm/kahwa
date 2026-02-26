import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MatchApiService {
  private readonly baseUrl = 'http://localhost:3000/matches/demo-match-1';

  constructor(private readonly http: HttpClient) {}

  load() {
    return this.http.get<any>(this.baseUrl);
  }

  playTimer() {
    return this.http.patch<any>(`${this.baseUrl}/timer/play`, {});
  }

  pauseTimer() {
    return this.http.patch<any>(`${this.baseUrl}/timer/pause`, {});
  }

  setPeriod(period: 'FIRST_HALF' | 'SECOND_HALF' | 'EXTRA_TIME') {
    return this.http.patch<any>(`${this.baseUrl}/timer/period`, { period });
  }

  addAdditional(seconds: number) {
    return this.http.patch<any>(`${this.baseUrl}/timer/additional`, { seconds });
  }

  resetHalf() {
    return this.http.patch<any>(`${this.baseUrl}/timer/reset-half`, {});
  }

  addEvent(payload: any) {
    return this.http.post<any>(`${this.baseUrl}/events`, payload);
  }
}
