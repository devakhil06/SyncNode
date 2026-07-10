const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit(
    "joinWorkspace",
    "6a4f1333d9b8658a2766b4b5"
  );
});

socket.on("taskCreated", (task) => {
  console.log("Task Created");
  console.log(task);
});

socket.on("taskUpdated", (task) => {
  console.log("Task Updated");
  console.log(task);
});

socket.on("taskDeleted", (data) => {
  console.log("Task Deleted");
  console.log(data);
});