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
  isReady: boolean;
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
let result: Result = {};
// can not accept new user if true
let isResultGenerated = false;

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
  const newRe: Result = {};
  for (const _ of Array(NUM_GEN)) {
    // generated result
    const genRe = Math.floor(Math.random() * ANIMAL_IDS.length);
    newRe[genRe] = (newRe[genRe] || 0) + 1;
  }
  return newRe;
};

const resetGame = () => {
  Object.values(users).forEach((user) => {
    user.betAnimal = {};
  });
  result = {};
  isResultGenerated = false;
};

io.on("connection", (socket) => {
  const sendUserDatas = () => {
    io.emit("listUsersData", users);
  };
  socket.on("disconnecting", (reason) => {
    console.log(`user ${socket.id} leave room`);
    delete users[socket.id];
    socket.broadcast.emit("listUsersData", users);
    if (Object.keys(users).length === 0) {
      resetGame();
    }
  });
  socket.on("userJoin", (newUser: RegisterUser, callback) => {
    console.log("userJoin received: ", JSON.stringify(newUser));
    if (isResultGenerated) {
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
      isReady: false,
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
    console.log("bet action: ", JSON.stringify(userBet));
    const { userId, animalId, betAmount } = userBet;
    const userBetting = users[userId];
    if (userBetting.isReady) {
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
  socket.on("confirmAction", (userId: string, callback) => {
    console.log(`user ${userId} wanna confirm bet`);
    if (isResultGenerated) {
      callback({
        status: "not all player ready",
        success: false,
      });
      return;
    }
    users[userId].isReady = true;
    callback({
      success: true,
    });
    // check if all players is confirmed
    if (Object.values(users).every((us) => us.isReady)) {
      generateResult();
      isResultGenerated = true;
      io.emit("resultBet", result, users);
    } else {
      sendUserDatas();
    }
  });

  socket.on("wannaResetAction", (userId: string, callback) => {
    console.log(`user ${userId} wanna reset game`);
    users[userId].isReady = false;
    // if result not generated
    if (!isResultGenerated) {
      callback({
        status: "Users are betting",
        success: false,
      });
      return;
    }
    // if all other players already wanna reset game then reset game
    if (Object.values(users).every((us) => !us.isReady)) {
      // change state of server
      resetGame();
      // change other state
      io.emit("resetGame");
      // else change state of the user
    } else {
      sendUserDatas();
    }
  });
});

io.listen(3000);
// confirmAction
