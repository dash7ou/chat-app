const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./helpers/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./helpers/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//?put static file
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

//?listen to event connection

io.on("connection", socket => {
  console.log("new webSocket connection");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room
    });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    socket.emit(
      "WelcomeMessage",
      generateMessage("ADMIN SERVER", `Welcome ${user.username}!!`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "WelcomeMessage",
        generateMessage(
          "ADMIN SERVER",
          `${user.username} has Join to chat room: ${user.room}`
        )
      );
    socket.on("EnterMessage", (msg, cb) => {
      const filter = new Filter();
      if (filter.isProfane(msg)) return cb("this world is not allow :(");
      io.to(user.room).emit(
        "ReturnMessage",
        generateMessage(user.username, msg)
      );
      cb();
    });
    socket.on("returnPositionToServer", (position, cb) => {
      io.to(user.room).emit(
        "returnPositionToTheClint",
        generateLocation(
          user.username,
          `http://google.com/maps?q=${position.latitude},${position.longitude}`
        )
      );
      cb();
    });

    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "leftMessage",
        generateMessage("ADMIN SERVER", `A ${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// ?setup port server
const port = process.env.PORT || 3000;
server.listen(`${port}`, _ => {
  console.log(`Server startup on port ${port}`);
});
