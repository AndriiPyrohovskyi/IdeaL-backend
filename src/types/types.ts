import { Request } from 'express';

export interface User {
  id?: string;
  uid: string;
  username: string;
  email: string;
  name?: string;
  created_at: Date;
  status: 'active' | 'inactive' | 'banned';
}
  
  export interface Voting {
    id?: string;
    author_id: string;
    title: string;
    description: string;
    created_at: Date;
    tag: string;
    status: 'active' | 'closed' | 'deleted';
    result_text?: string;
  }
  
  export interface Vote {
    id?: string;
    voting_id: string;
    user_id: string;
    voted_at: Date;
  }
  
  export interface UserBan {
    id?: string;
    user_id: string;
    reason: string;
    banned_at: Date;
    banned_to: Date;
  }
  
  export interface AuthenticatedRequest extends Request {
    user?: {
      uid: string;
      email?: string;
      name?: string;
      role?: string;
    };
  }