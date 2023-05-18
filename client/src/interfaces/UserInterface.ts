export interface RegisterUser {
  avaSrc: string;
  name: string;
}

// {[animalId]: betamount}
export type BetUser2Animal = Record<string, number>;
// {[userId]: {[animalId]: betamount}}
export type BetAnimal2User = Record<string, Record<string, number>>;
// user bet result
export interface User extends RegisterUser {
  id: string;
  /** if ready, user cannot
   * bet any more on that round */
  isReady: boolean;
  balance: number;
  betAnimal: BetUser2Animal;
}
