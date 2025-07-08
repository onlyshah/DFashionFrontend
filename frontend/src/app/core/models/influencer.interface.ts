export interface Influencer {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  postsCount: number;
  engagement?: number;
  isFollowing: boolean;
  isInfluencer: boolean;
  socialStats?: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
    sharesReceived: number;
  };
  category?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
