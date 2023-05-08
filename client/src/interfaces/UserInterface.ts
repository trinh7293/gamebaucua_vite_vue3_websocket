export interface RegisterUser {
  avaSrc: string;
  name: string;
}

// {[userId]: {[animalId]: betamount}}
export type BetUser2Animal = Record<string, Record<string, number>>;
// {[userId]: {[animalId]: betamount}}
export type BetAnimal2User = Record<string, Record<string, number>>;
// user bet result
export interface User extends RegisterUser {
  id: string;
  /** if confirm bet amounts, user cannot
   * bet any more on that round */
  isConfirm: boolean;
}