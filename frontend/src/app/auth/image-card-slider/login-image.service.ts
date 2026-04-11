import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginImageService {
  private readonly apiEndpoint = `${environment.apiUrl}/api/images`;
  private readonly fallbackImages = [
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495121605193-b116b5b9c5c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1458253329476-1ebb8593a652?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507120410856-1f35574c3b45?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545312320-3a566832d3de?auto=format&fit=crop&w=800&q=80'
  ];

  private readonly imagesSubject = new BehaviorSubject<string[]>(this.fallbackImages);
  readonly images$ = this.imagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadImages();
  }

  private loadImages(): void {
    this.http.get<{ images: string[] }>(this.apiEndpoint).pipe(
      map(response => this.normalizeImages(response?.images)),
      catchError(() => of(this.fallbackImages)),
      tap(images => this.imagesSubject.next(images))
    ).subscribe();
  }

  private normalizeImages(images?: string[]): string[] {
    const resolved = (images || []).filter(Boolean).map(url => this.resolveImageUrl(url));
    const combined = [...resolved, ...this.fallbackImages].slice(0, 10);
    return combined.length ? combined : this.fallbackImages;
  }

  private resolveImageUrl(url: string): string {
    if (!url) {
      return this.fallbackImages[0];
    }

    if (/^https?:\/\//.test(url)) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${environment.apiUrl}${url}`;
    }

    return `${environment.apiUrl}/${url}`;
  }
}
