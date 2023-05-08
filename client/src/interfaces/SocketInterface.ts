import type { BetAnimal2User, BetUser2Animal, User } from './UserInterface';

export interface StateType {
  isJoin: boolean;
  currentUserId: string | null;
  // {[userId]: <User>}
  users: Record<string, User> | null;
  betUser2Animal: BetUser2Animal;
  betAnimal2User: BetAnimal2User;
  readyToGen: boolean;
}

// user bet action
export interface UserBet {
  userId: string;
  // animal id: bet amount
  animalBets: Record<string, number>;
}

export interface UserJoinRes {
  status: string;
  success: boolean;
  userId?: string;
}

export interface UserBetRes {
  success: boolean;
  status: string;
}

export interface UserConfirmRes {
  success: boolean;
  status: string;
}
