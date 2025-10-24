export interface ContentReport {
    id: string;
    contentId: string;
    contentType: 'post' | 'comment' | 'product' | 'reel' | 'story';
    reporterId: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: string;
    resolution?: string;
    evidence?: string[];
}