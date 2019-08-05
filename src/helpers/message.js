const generateMessage = function(username, text) {
  return {
    username,
    text,
    createAt: new Date().getTime()
  };
};

const generateLocation = (username, location) => {
  return {
    username,
    location,
    createAt: new Date().getTime()
  };
};
module.exports = {
  generateMessage,
  generateLocation
};
