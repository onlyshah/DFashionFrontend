import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Review {
  _id: string;
  userId: string;
  productId: string;
  orderId?: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number; // Number of helpful votes
  userHelpful?: boolean; // Whether current user marked as helpful
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewRequest {
  productId: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface ReviewResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  stats: ReviewStats;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly API_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // Get reviews for a product
  getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'newest' | 'oldest' | 'helpful' | 'rating' = 'newest',
    rating?: number
  ): Observable<ReviewResponse> {
    console.log('[ReviewService] Getting reviews for product:', productId, { page, limit, sortBy, rating });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    if (rating) {
      params = params.set('rating', rating.toString());
    }

    return this.http.get<ReviewResponse>(`${this.API_URL}/products/${productId}/reviews`, { params }).pipe(
      tap(response => {
        console.log('[ReviewService] Reviews loaded:', response.total, 'Average rating:', response.stats.averageRating);
      })
    );
  }

  // Get review statistics for a product
  getProductReviewStats(productId: string): Observable<ReviewStats> {
    console.log('[ReviewService] Getting review stats for product:', productId);
    return this.http.get<ReviewStats>(`${this.API_URL}/products/${productId}/reviews/stats`).pipe(
      tap(stats => {
        console.log('[ReviewService] Review stats loaded:', stats);
      })
    );
  }

  // Create a new review
  createReview(reviewData: CreateReviewRequest): Observable<{ message: string; review: Review }> {
    console.log('[ReviewService] Creating review for product:', reviewData.productId);
    return this.http.post<{ message: string; review: Review }>(`${this.API_URL}/reviews`, reviewData).pipe(
      tap(response => {
        console.log('[ReviewService] Review created:', response.review._id);
      })
    );
  }

  // Update a review
  updateReview(reviewId: string, updateData: Partial<CreateReviewRequest>): Observable<{ message: string; review: Review }> {
    console.log('[ReviewService] Updating review:', reviewId);
    return this.http.put<{ message: string; review: Review }>(`${this.API_URL}/reviews/${reviewId}`, updateData).pipe(
      tap(response => {
        console.log('[ReviewService] Review updated:', response.review._id);
      })
    );
  }

  // Delete a review
  deleteReview(reviewId: string): Observable<{ message: string }> {
    console.log('[ReviewService] Deleting review:', reviewId);
    return this.http.delete<{ message: string }>(`${this.API_URL}/reviews/${reviewId}`).pipe(
      tap(response => {
        console.log('[ReviewService] Review deleted');
      })
    );
  }

  // Mark review as helpful
  markHelpful(reviewId: string): Observable<{ message: string; helpfulCount: number }> {
    console.log('[ReviewService] Marking review as helpful:', reviewId);
    return this.http.post<{ message: string; helpfulCount: number }>(`${this.API_URL}/reviews/${reviewId}/helpful`, {}).pipe(
      tap(response => {
        console.log('[ReviewService] Review marked helpful, new count:', response.helpfulCount);
      })
    );
  }

  // Report a review
  reportReview(reviewId: string, reason: string): Observable<{ message: string }> {
    console.log('[ReviewService] Reporting review:', reviewId, 'Reason:', reason);
    return this.http.post<{ message: string }>(`${this.API_URL}/reviews/${reviewId}/report`, { reason }).pipe(
      tap(response => {
        console.log('[ReviewService] Review reported');
      })
    );
  }

  // Get user's reviews
  getUserReviews(userId: string, page: number = 1, limit: number = 10): Observable<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.log('[ReviewService] Getting reviews by user:', userId, { page, limit });

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{
      reviews: Review[];
      total: number;
      page: number;
      limit: number;
    }>(`${this.API_URL}/users/${userId}/reviews`, { params }).pipe(
      tap(response => {
        console.log('[ReviewService] User reviews loaded:', response.total);
      })
    );
  }

  // Check if user can review a product (has purchased and not already reviewed)
  canReviewProduct(productId: string): Observable<{
    canReview: boolean;
    hasPurchased: boolean;
    hasReviewed: boolean;
    orderId?: string;
  }> {
    console.log('[ReviewService] Checking if user can review product:', productId);
    return this.http.get<{
      canReview: boolean;
      hasPurchased: boolean;
      hasReviewed: boolean;
      orderId?: string;
    }>(`${this.API_URL}/products/${productId}/can-review`).pipe(
      tap(response => {
        console.log('[ReviewService] Can review check:', response);
      })
    );
  }

  // Get pending reviews (products user can review but hasn't yet)
  getPendingReviews(page: number = 1, limit: number = 10): Observable<{
    pendingReviews: Array<{
      productId: string;
      productName: string;
      productImage: string;
      orderId: string;
      orderDate: Date;
      canReview: boolean;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    console.log('[ReviewService] Getting pending reviews:', { page, limit });

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{
      pendingReviews: Array<{
        productId: string;
        productName: string;
        productImage: string;
        orderId: string;
        orderDate: Date;
        canReview: boolean;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`${this.API_URL}/reviews/pending`, { params }).pipe(
      tap(response => {
        console.log('[ReviewService] Pending reviews loaded:', response.total);
      })
    );
  }
}