export type FollowStatus = 'pending' | 'accepted' | 'rejected';

export interface Follower {
  id: number;
  userId: number;
  followerId: number;
  status: FollowStatus;
}

export type CreateFollowerDto = Omit<Follower, 'id'>;
