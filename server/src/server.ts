import { Server } from "socket.io";
import { ANIMAL_IDS, NUM_GEN } from "./constants";
import _ from "lodash";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

interface RegisterUser {
  avaSrc: string;
  name: string;
}

interface User extends RegisterUser {
  id: string;
  /** if confirm bet amounts, user cannot
   * bet any more on that round */
  isConfirm: boolean;
  balance: number;
  betAnimal: BetUser2animal;
}

// {[animalId]: betamount}
type BetUser2animal = Record<string, number>;

// user bet action
export interface UserBet {
  userId: string;
  animalId: string;
  betAmount: number;
}
interface Result {
  // animalId: bet amount
  [key: string]: number;
}

// list user
// {[userId]: User}
const users: Record<string, User> = {};
// result bet
let result: Record<string, number> = {};
// can accept new user
let isBetting = true;

const generateResult = () => {
  result = generateRandomAnimal();
  Object.entries(users).forEach(([userId, user]) => {
    let winAmount = 0;
    Object.entries(user.betAnimal).forEach(([animalId, betAmount]) => {
      const animalWinAmount = (result[animalId] || -1) * betAmount;
      winAmount += animalWinAmount;
    });
    users[userId].balance += winAmount;
  });
};

const generateRandomAnimal = () => {
  // generate new result
  const newRe: Record<string, number> = {};
  for (const _ of Array(NUM_GEN)) {
    // generated result
    const genRe = Math.floor(Math.random() * ANIMAL_IDS.length);
    newRe[genRe] = (newRe[genRe] || 0) + 1;
  }
  return newRe;
};

io.on("connection", (socket) => {
  const sendUserDatas = () => {
    io.emit("listUsersData", users);
  };
  socket.on("userJoin", (newUser: RegisterUser, callback) => {
    console.log("userJoin received: ", JSON.stringify(newUser));
    if (!isBetting) {
      callback({
        status: "game is ready",
        success: false,
      });
      return;
    }
    const userId: string = socket.id;
    users[userId] = {
      ...newUser,
      id: userId,
      isConfirm: false,
      betAnimal: {},
      balance: 0,
    };
    callback({
      success: true,
      userId,
    });
    sendUserDatas();
  });
  socket.on("betAction", (userBet: UserBet, callback) => {
    const { userId, animalId, betAmount } = userBet;
    const userBetting = users[userId];
    if (userBetting.isConfirm) {
      callback({
        status: "user already confirm",
        success: false,
      });
      return;
    }
    // userBetting.betAnimal
    _.setWith(userBetting, `betAnimal.${animalId}`, betAmount);
    callback({
      success: true,
    });
    sendUserDatas();
  });
  socket.on("userConfirm", (userId: string, callback) => {
    users[userId].isConfirm = true;
    callback({
      success: true,
    });
    sendUserDatas();
    // check if all players is confirmed
    if (Object.values(users).every((us) => us.isConfirm)) {
      isBetting = false;
      generateResult();
      io.emit("resultBet", result, users);
    }
  });
  socket.on("disconnecting", (reason) => {
    console.log(`user ${socket.id} leave room`);
    delete users[socket.id];
    socket.broadcast.emit("listUsersData", users);
  });
});

io.listen(3000);
