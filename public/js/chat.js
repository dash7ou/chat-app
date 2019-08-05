const socket = io();

//Element
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Option
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  //height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of messages contener
  const contenerHeight = $messages.scrollHeight;

  //how far i should scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;
  if (contenerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("WelcomeMessage", msg => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createAt: moment(msg.createAt).format("hh:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = $messageForm.firstElementChild.value;

  socket.emit("EnterMessage", message, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) return console.log(error);

    console.log("The message was delivered !");
  });
});

socket.on("ReturnMessage", (msg, cb) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createAt: moment(msg.createAt).format("hh:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("leftMessage", msg => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createAt: moment(msg.createAt).format("hh:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $sendLocationButton.setAttribute("disabled", "disabled");
    return alert("You browser not supported geolocation");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(position => {
    // console.log(position);
    $sendLocationButton.removeAttribute("disabled");

    socket.emit(
      "returnPositionToServer",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        console.log("Location share successful :)");
      }
    );
  });
});

socket.on("returnPositionToTheClint", position => {
  const html = Mustache.render(locationMessageTemplate, {
    username: position.username,
    url: position.location,
    createAt: moment(position.createAt).format("hh:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.getElementById("aside").innerHTML = html;
});
