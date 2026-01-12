import { Component, OnInit } from '@angular/core';
import { CmsService } from '../../services/cms.service';

@Component({
  selector: 'app-cms',
  templateUrl: './cms.component.html',
  styleUrls: ['./cms.component.scss']
})
export class CmsComponent implements OnInit {
  pages: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private cmsService: CmsService) {}

  ngOnInit(): void {
    this.loadPages();
  }

  loadPages(): void {
    this.isLoading = true;
    this.error = null;
    this.cmsService.getPages().subscribe({
      next: (res) => {
        this.pages = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load CMS pages from backend.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
