import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ModerationService } from './moderation.service';

describe('ModerationService', () => {
    let service: ModerationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ModerationService]
        });

        service = TestBed.inject(ModerationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load reports on loadReports call', () => {
        const mockReports = [
            { id: 'r1', contentId: 'c1', contentType: 'post', reporterId: 'u1', reason: 'spam', status: 'pending', createdAt: new Date(), updatedAt: new Date() }
        ];

        service.loadReports();

        const req = httpMock.expectOne(req => req.method === 'GET' && req.url.includes('/moderation/reports'));
        expect(req).toBeTruthy();
        req.flush(mockReports);

        service.reports$.subscribe(reports => {
            expect(reports.length).toBe(1);
            expect(reports[0].id).toBe('r1');
        });
    });
});