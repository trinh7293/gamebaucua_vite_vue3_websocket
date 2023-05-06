import { Server } from "socket.io";
const uuidv4 = require("uuid/v4");

/**
 * TODO:
 * 1. gen result
 * 2. get result amount
 */

const io = new Server({
  cors: {
    origin: "http://localhost:8080",
  },
});

interface User {
  id?: string;
  avaSrc: string;
  name: string;
  /** if confirm bet amounts, user cannot
   * bet any more on that round */
  isConfirm: boolean;
  animalBets?: {
    // animal id: bet amount
    [key: string]: number;
  };
}

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
const users: User[] = [];
// result bet
const result = {};
// can accept new user
let readyToGen = true;

io.on("connection", (socket) => {
  socket.on("userJoin", (newUser: User, callback) => {
    if (!readyToGen) {
      callback({
        isJoin: false,
      });
      return;
    }
    const userId: string = uuidv4();
    users.push({
      ...newUser,
      id: userId,
    });
    callback({
      users,
      isJoin: true,
    });
  });
  socket.on("betAction", (userBet: UserBet, callback) => {
    const { userId } = userBet;
    const user = users.find((us) => us.id === userId);
    if (!user) {
      callback({
        success: false,
        status: "cannot find user",
      });
      return;
    }
    if (user.isConfirm) {
      callback({
        success: false,
        status: "User is confirmed",
      });
      return;
    }
    user.animalBets = userBet.animalBets;
  });
  socket.on("userConfirm", (userId: string, callback) => {
    const user = users.find((us) => us.id === userId);
    if (!user) {
      callback({
        success: false,
        status: "cannot find user",
      });
      return;
    }
    user.isConfirm = true;
    if (users.every((us) => us.isConfirm)) {
      readyToGen = true;
      socket.broadcast.emit("sendUserInfo", users);
    }
  });
});

io.listen(3000);
