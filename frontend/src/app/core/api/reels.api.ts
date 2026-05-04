import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReelsApi {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Get all reels (paginated)
   */
  listReels(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/reels`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Get all reels in the system
   */
  getAllReels(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/reels`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Get user's own reels
   */
  getUserReels(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/reels/user/my-reels`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Get reels from users the current user is following
   */
  getFollowingReels(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/reels/following`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  /**
   * Get a single reel by ID
   */
  getReelById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reels/${id}`);
  }

  /**
   * Like a reel
   */
  likeReel(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reels/${id}/like`, {});
  }

  /**
   * Unlike a reel
   */
  unlikeReel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reels/${id}/like`);
  }

  /**
   * Save a reel
   */
  saveReel(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reels/${id}/save`, {});
  }

  /**
   * Unsave a reel
   */
  unsaveReel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reels/${id}/save`);
  }

  /**
   * Get saved reels
   */
  getSavedReels(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/reels/user/saved`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }
}

