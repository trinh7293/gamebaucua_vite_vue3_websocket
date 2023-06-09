import { reactive } from 'vue';
import { io } from 'socket.io-client';
import type { RegisterUser, User } from './interfaces/UserInterface';
import type {
  ResultBet,
  SocketRespone,
  StateType,
  UserBet,
  UserJoinRes,
} from './interfaces/SocketInterface';

export const state: StateType = reactive({
  isJoin: false,
  currentUserId: null,
  users: {},
  isResultGenerated: false,
  resultBet: {},
});

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
const URL = 'http://localhost:3000';

export const socket = io(URL);

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

socket.on('resultBet', (resultBet: ResultBet, users: Record<string, User>) => {
  state.isResultGenerated = true;
  state.resultBet = resultBet;
  state.users = users;
});

socket.on('resetGame', () => {
  state.isResultGenerated = false;
  state.resultBet = {};
  const newUsers = state.users;
  Object.values(newUsers).forEach(user => {
    user.betAnimal = {};
    user.isReady = false;
  });
  state.users = { ...newUsers };
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
  const userBet: UserBet = {
    userId: state.currentUserId,
    animalId,
    betAmount,
  };
  socket.emit('betAction', userBet, (res: SocketRespone) => {
    if (!res.success) {
      console.log(res.status);
      return;
    }
    if (!state.currentUserId) {
      console.log('!state.currentUserId');
    }
  });
};

export const confirmBet = (): void => {
  if (!state.currentUserId) {
    console.log('!state.currentUserId');
    return;
  }
  socket.emit('confirmAction', state.currentUserId, (res: SocketRespone) => {
    if (!state.currentUserId) {
      console.log('!state.currentUserId');
    }
    if (!res.success) {
      console.log(res.status);
    }
  });
};

export const wantResetGame = (): void => {
  if (!state.currentUserId) {
    console.log('!state.currentUserId');
    return;
  }
  socket.emit('wannaResetAction', state.currentUserId, (res: SocketRespone) => {
    if (!res.success) {
      console.log(res.status);
    }
  });
};
