import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaces
interface Category {
  name: string;
  slug: string;
  image: string;
  itemCount: number;
}

interface Brand {
  name: string;
  slug: string;
  logo: string;
  description: string;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})

export class ExploreComponent implements OnInit {
  searchQuery = '';
  
  categories: Category[] = [];

  trendingItems: any[] = [];

  featuredBrands: Brand[] = [];

  styleInspiration = [
    {
      id: 1,
      title: 'Office Chic',
      subtitle: 'Professional yet stylish',
      image: '', // Set from backend
      tags: ['Professional', 'Elegant', 'Modern']
    },
    {
      id: 2,
      title: 'Weekend Casual',
      subtitle: 'Comfortable and relaxed',
      image: '', // Set from backend
      tags: ['Casual', 'Comfortable', 'Trendy']
    },
    {
      id: 3,
      title: 'Evening Glam',
      subtitle: 'Glamorous night out looks',
      image: '', // Set from backend
      tags: ['Glamorous', 'Party', 'Elegant']
    }
  ];

  constructor() {}

  ngOnInit() {}

  onSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to search results
      console.log('Searching for:', this.searchQuery);
      // TODO: Implement search navigation
    }
  }

  navigateToCategory(categorySlug: string) {
    // Navigate to category page
    console.log('Navigate to category:', categorySlug);
    // TODO: Implement category navigation
  }

  exploreBrand(brandSlug: string) {
    console.log('Explore brand:', brandSlug);
    // TODO: Implement brand exploration
  }

  viewInspiration(inspirationId: number) {
    console.log('View inspiration:', inspirationId);
    // TODO: Implement inspiration view
  }
}
