import type { User } from './UserInterface';

export interface StateType {
  isJoin: boolean;
  currentUserId: string | null;
  // {[userId]: <User>}
  users: Record<string, User>;
  isResultGenerated: boolean;
  resultBet: ResultBet;
}

export type ResultBet = Record<string, number>;

// user bet action
export interface UserBet {
  userId: string;
  animalId: string;
  betAmount: number;
}

export interface UserJoinRes {
  status: string;
  success: boolean;
  userId?: string;
}

export interface SocketRespone {
  success: boolean;
  status: string;
}
