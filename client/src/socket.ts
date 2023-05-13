import { reactive } from 'vue';
import { io } from 'socket.io-client';
import type {
  BetUser2Animal,
  RegisterUser,
  User,
} from './interfaces/UserInterface';
import type {
  StateType,
  UserBet,
  UserBetRes,
  UserConfirmRes,
  UserJoinRes,
} from './interfaces/SocketInterface';

import _ from 'lodash';

export const state: StateType = reactive({
  isConfirm: false,
  isJoin: false,
  currentUserId: null,
  users: null,
  betUser2Animal: {},
  betAnimal2User: {},
  readyToGen: false,
});

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
const URL = 'http://localhost:3000';

export const socket = io(URL);

socket.on('ready2Gen', (betUser2animal: BetUser2Animal) => {
  state.readyToGen = true;
  state.betUser2Animal = betUser2animal;
  Object.entries(betUser2animal).forEach(([userId, aniBet]) => {
    Object.entries(aniBet).forEach(([animalId, betAmount]) => {
      state.betAnimal2User = _.setWith(
        { ...state.betAnimal2User },
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `${animalId}.${userId}`,
        betAmount
      );
      // state.betAnimal2User[animalId][userId] = betAmount;
    });
  });
});

socket.on('connect', () => {
  console.log('connected');
});

socket.on('disconnect', () => {
  console.log('disconnected');
});

socket.on('listUsersData', (users: Record<string, User>) => {
  console.log('listUsersData listener: ', JSON.stringify(users));
  state.users = users;
});

export const joinGame = (newUser: RegisterUser): void => {
  socket.emit('userJoin', newUser, (res: UserJoinRes) => {
    console.log('res userJoin: ', JSON.stringify(res));
    if (!res.success) {
      console.log(res.status);
      return;
    }
    state.isJoin = true;
    state.currentUserId = res.userId || '';
  });
};

export const betAction = (animalId: string, betAmount: number): void => {
  if (!state.currentUserId) {
    console.log('!state.currentUserId');
    return;
  }
  const animalBets = { [animalId]: betAmount };
  const userBet: UserBet = {
    userId: state.currentUserId,
    animalBets,
  };
  socket.emit('betAction', userBet, (res: UserBetRes) => {
    if (!res.success) {
      console.log(res.status);
      return;
    }
    if (!state.currentUserId) {
      console.log('!state.currentUserId');
      return;
    }
    state.betUser2Animal = _.setWith(
      { ...state.betUser2Animal },
      `${state.currentUserId}.${animalId}`,
      betAmount
    );
    state.betAnimal2User = _.setWith(
      { ...state.betAnimal2User },
      `${animalId}.${state.currentUserId}`,
      betAmount
    );
  });
};

export const confirmBet = (): void => {
  if (!state.currentUserId) {
    console.log('!state.currentUserId');
    return;
  }
  socket.emit('userConfirm', state.currentUserId, (res: UserConfirmRes) => {
    if (!res.success) {
      console.log(res.status);
      return;
    }
    if (!state.currentUserId) {
      console.log('!state.currentUserId');
      return;
    }
    state.isConfirm = true;
  });
};
