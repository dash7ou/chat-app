const users = [];
const rooms = [];

// addUser ,removeUser, getUser, getUserInRoom

const addUser = ({ id, username, room }) => {
  //clean the data

  username = typeof username == "string" ? username : false;
  room = typeof room == "string" ? room : false;

  if (!username || !room) return { error: "not validate username or room" };

  username = username.toLowerCase().trim();
  room = room.toUpperCase().trim();

  if (!username || !room) return { error: `username and room are required` };

  //check for the existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  //validate user
  if (existingUser) {
    return { error: "This user is already exist" };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  if (users.length == 0) return { error: "no user in app to delete" };

  id = typeof id == "string" ? id : false;
  if (!id) return { error: "This id is not validate" };

  const index = users.findIndex(user => user.id === id);

  if (index == -1) {
    return { error: "Sorry no user to delete it" };
  }

  return users.splice(index, 1)[0];
};

const getUser = id => {
  if (users.length == 0) return { error: "no user in app to delete" };

  id = typeof id == "string" ? id : false;
  if (!id) return { error: "This id is not validate" };

  const user = users.find(user => user.id == id);
  if (!user) return { error: "no user to find him" };

  return user;
};

const getUsersInRoom = roomName => {
  roomName = typeof roomName == "string" ? roomName : false;
  if (!roomName) return { error: "Enter validate room name" };

  const usersRoom = users.filter(user => user.room == roomName.toUpperCase());
  if (!usersRoom) return { error: "No users" };
  return usersRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};

console.log(users);
