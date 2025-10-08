import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { EcommerceService } from '../../../../core/services/ecommerce.service';
import { AuthService } from '../../../../core/services/auth.service';

export interface Story {
    id: string;
    userId: string;
    username: string;
    userAvatar: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    timestamp: Date;
    isViewed: boolean;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    userAvatar: string;
    caption: string;
    mediaUrls: string[];
    mediaType: 'image' | 'video' | 'carousel';
    likes: number;
    comments: number;
    timestamp: Date;
    isLiked: boolean;
    isSaved: boolean;
    location?: string;
    tags: string[];
}

export interface TrendingProduct {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    brand: string;
    rating: number;
    isWishlisted: boolean;
}

@Component({
    selector: 'app-user-social-dashboard',
    standalone: true,
    imports: [CommonModule, IonicModule],
    styleUrls: ['./user-social-dashboard.component.scss'],
    templateUrl: './user-social-dashboard.component.html'
})
export class UserSocialDashboardComponent implements OnInit, OnDestroy {
    @Input() currentUser: any;
    @Input() availableFeatures: string[] = [];
    @Input() isMobile = false;

    stories: Story[] = [];
    posts: Post[] = [];
    trendingProducts: TrendingProduct[] = [];
    suggestedProducts: TrendingProduct[] = [];
    featuredBrands: any[] = [];

    isLoadingMore = false;
    isVendor = false;

    private subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private ecommerceService: EcommerceService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.checkUserRole();
        this.loadSocialContent();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private checkUserRole() {
        this.isVendor = this.currentUser?.role === 'vendor';
    }

    private loadSocialContent() {
        this.loadStories();
        this.loadPosts();
        this.loadTrendingProducts();
        this.loadSuggestedProducts();
        this.loadFeaturedBrands();
    }

    private loadStories() {
        // Load stories from API
        this.stories = [];
    }

    private loadPosts() {
        // Load posts from API
        this.posts = [];
    }

    private loadTrendingProducts() {
        if (this.hasFeature('shopping')) {
            const sub = this.ecommerceService.getTrendingProducts().subscribe({
                next: (products) => {
                    this.trendingProducts = products.slice(0, 5);
                },
                error: (error) => {
                    console.error('Failed to load trending products:', error);
                }
            });
            this.subscriptions.push(sub);
        }
    }

    private loadSuggestedProducts() {
        if (this.hasFeature('shopping')) {
            const sub = this.ecommerceService.getSuggestedProducts().subscribe({
                next: (products) => {
                    this.suggestedProducts = products.slice(0, 8);
                },
                error: (error) => {
                    console.error('Failed to load suggested products:', error);
                }
            });
            this.subscriptions.push(sub);
        }
    }

    private loadFeaturedBrands() {
        if (this.hasFeature('shopping')) {
            const sub = this.ecommerceService.getFeaturedBrands().subscribe({
                next: (brands) => {
                    this.featuredBrands = brands.slice(0, 6);
                },
                error: (error) => {
                    console.error('Failed to load featured brands:', error);
                }
            });
            this.subscriptions.push(sub);
        }
    }

    // UI Actions
    createStory() {
        this.router.navigate(['/create/story']);
    }

    viewStory(story: Story) {
        this.router.navigate(['/stories', story.id]);
    }

    createPost(type?: string) {
        if (type) {
            this.router.navigate(['/create/post'], { queryParams: { type } });
        } else {
            this.router.navigate(['/create/post']);
        }
    }

    toggleLike(post: Post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        // TODO: Call API to update like status
    }

    toggleSave(post: Post) {
        post.isSaved = !post.isSaved;
        // TODO: Call API to update save status
    }

    openComments(post: Post) {
        this.router.navigate(['/post', post.id, 'comments']);
    }

    sharePost(post: Post) {
        // TODO: Implement share functionality
    }

    toggleWishlist(product: TrendingProduct) {
        product.isWishlisted = !product.isWishlisted;
        // TODO: Call API to update wishlist status
    }

    addToCart(product: TrendingProduct) {
        // TODO: Call API to add to cart
    }

    // Navigation
    navigateToWishlist() {
        this.router.navigate(['/wishlist']);
    }

    navigateToCart() {
        this.router.navigate(['/cart']);
    }

    navigateToOrders() {
        this.router.navigate(['/orders']);
    }

    hasFeature(feature: string): boolean {
        return this.availableFeatures.includes(feature);
    }
}
