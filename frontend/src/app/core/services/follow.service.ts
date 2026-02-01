import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface FollowData {
  _id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface UserFollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface FollowResponse {
  success: boolean;
  message: string;
  follow?: FollowData;
  stats?: UserFollowStats;
}

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private readonly API_URL = `${environment.apiUrl}/api`;

  // Cache for follow stats to avoid repeated API calls
  private followStatsCache = new Map<string, UserFollowStats>();

  constructor(private http: HttpClient) {}

  // Follow a user
  followUser(userId: string): Observable<FollowResponse> {
    console.log('[FollowService] Following user:', userId);
    return this.http.post<FollowResponse>(`${this.API_URL}/users/${userId}/follow`, {}).pipe(
      tap(response => {
        console.log('[FollowService] Follow response:', response);
        // Invalidate cache for this user
        this.followStatsCache.delete(userId);
      })
    );
  }

  // Unfollow a user
  unfollowUser(userId: string): Observable<FollowResponse> {
    console.log('[FollowService] Unfollowing user:', userId);
    return this.http.delete<FollowResponse>(`${this.API_URL}/users/${userId}/follow`).pipe(
      tap(response => {
        console.log('[FollowService] Unfollow response:', response);
        // Invalidate cache for this user
        this.followStatsCache.delete(userId);
      })
    );
  }

  // Get follow stats for a user
  getFollowStats(userId: string): Observable<UserFollowStats> {
    console.log('[FollowService] Getting follow stats for user:', userId);

    // Check cache first
    if (this.followStatsCache.has(userId)) {
      console.log('[FollowService] Returning cached follow stats');
      return new BehaviorSubject(this.followStatsCache.get(userId)!).asObservable();
    }

    return this.http.get<UserFollowStats>(`${this.API_URL}/users/${userId}/follow-stats`).pipe(
      tap(stats => {
        console.log('[FollowService] Follow stats loaded:', stats);
        // Cache the result
        this.followStatsCache.set(userId, stats);
      })
    );
  }

  // Get followers list
  getFollowers(userId: string, page: number = 1, limit: number = 20): Observable<{
    followers: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.log('[FollowService] Getting followers for user:', userId, { page, limit });
    return this.http.get<{
      followers: any[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.API_URL}/users/${userId}/followers`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        console.log('[FollowService] Followers loaded:', response.total);
      })
    );
  }

  // Get following list
  getFollowing(userId: string, page: number = 1, limit: number = 20): Observable<{
    following: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.log('[FollowService] Getting following for user:', userId, { page, limit });
    return this.http.get<{
      following: any[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.API_URL}/users/${userId}/following`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        console.log('[FollowService] Following loaded:', response.total);
      })
    );
  }

  // Check if current user is following another user
  isFollowing(userId: string): Observable<boolean> {
    console.log('[FollowService] Checking if following user:', userId);
    return this.getFollowStats(userId).pipe(
      map(stats => stats.isFollowing)
    );
  }

  // Check if another user is following current user
  isFollowedBy(userId: string): Observable<boolean> {
    console.log('[FollowService] Checking if followed by user:', userId);
    return this.getFollowStats(userId).pipe(
      map(stats => stats.isFollowedBy)
    );
  }

  // Get mutual followers (users who follow each other)
  getMutualFollowers(userId: string, page: number = 1, limit: number = 20): Observable<{
    mutualFollowers: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.log('[FollowService] Getting mutual followers for user:', userId, { page, limit });
    return this.http.get<{
      mutualFollowers: any[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.API_URL}/users/${userId}/mutual-followers`, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        console.log('[FollowService] Mutual followers loaded:', response.total);
      })
    );
  }

  // Clear cache for a specific user (useful after profile updates)
  clearCache(userId: string): void {
    console.log('[FollowService] Clearing cache for user:', userId);
    this.followStatsCache.delete(userId);
  }

  // Clear all cache
  clearAllCache(): void {
    console.log('[FollowService] Clearing all follow stats cache');
    this.followStatsCache.clear();
  }
}