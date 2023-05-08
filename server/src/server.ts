import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

/**
 * TODO:
 * 1. gen result
 * 2. get result amount
 */

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
}

// {[userId]: {[animalId]: betamount}}
type BetUser2animal = Record<string, Record<string, number>>;

// user bet action
interface UserBet {
  userId: string;
  animalBets: {
    // animal id: bet amount
    [key: string]: number;
  };
}

interface Result {
  // animalId: bet amount
  [key: string]: number;
}

// list user
// {[userId]: User}
const users: Record<string, User> = {};
// user bet result
const betUser2animal: BetUser2animal = {};
// result bet
const result = {};
// can accept new user
let readyToGen = true;

io.on("connection", (socket) => {
  socket.on("userJoin", (newUser: RegisterUser, callback) => {
    console.log("userJoin received: ", JSON.stringify(newUser));
    if (!readyToGen) {
      callback({
        status: "game is ready",
        success: false,
      });
      return;
    }
    const userId: string = uuidv4();
    users[userId] = {
      ...newUser,
      id: userId,
      isConfirm: false,
    };
    callback({
      success: true,
      userId,
    });
    io.emit("userJoinSuccess", users);
  });
  socket.on("betAction", (userBet: UserBet, callback) => {
    if (users[userBet.userId].isConfirm) {
      callback({
        status: "user already confirm",
        success: false,
      });
      return;
    }
    if (!betUser2animal[userBet.userId]) {
      betUser2animal[userBet.userId] = userBet.animalBets;
    } else {
      betUser2animal[userBet.userId] = {
        ...betUser2animal[userBet.userId],
        ...userBet.animalBets,
      };
    }
    callback({
      success: true,
    });
  });
  socket.on("userConfirm", (userId: string, callback) => {
    users[userId].isConfirm = true;
    callback({
      success: true,
    });
    // check if all players is confirmed
    if (Object.values(users).every((us) => us.isConfirm)) {
      readyToGen = true;
      io.emit("ready2Gen", betUser2animal);
    }
  });
});

io.listen(3000);
