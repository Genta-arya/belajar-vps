const chatHistory = []; // In-memory array to store chat messages
const users = new Map(); // Map to store socket IDs and usernames
const usersWithUsername = new Set(); // Set to store socket IDs of users with usernames
const sessions = new Map(); // Map to store session ID and its end time

// Constants
const SESSION_DURATION = 5 * 1000; // 5 seconds session duration in milliseconds

export const manageChat = (io) => {
  // Function to reset the chat data
  function resetChatData() {
    chatHistory.length = 0; // Clear chat history
    users.clear(); // Clear users
    usersWithUsername.clear(); // Clear usernames
    sessions.clear(); // Clear sessions
    io.emit("chatHistory", chatHistory); // Notify clients
    io.emit("updateUsers", {
      users: [],
      count: 0,
    }); // Notify clients
  }

  // Function to check and close expired sessions
  function checkSessions() {
    const now = Date.now();
    for (const [socketId, sessionEndTime] of sessions.entries()) {
      if (now > sessionEndTime) {
        // Session expired
        const username = users.get(socketId);
        if (username) {
          io.emit("userLeft", username); // Notify all clients that user has left
        }
        io.sockets.sockets.get(socketId)?.disconnect(true); // Forcefully disconnect the socket
        users.delete(socketId);
        usersWithUsername.delete(socketId);
        sessions.delete(socketId);

        // Notify all clients about the updated user list and count of users with usernames
        const updatedUsers = Array.from(usersWithUsername).map((id) => users.get(id));
        io.emit("updateUsers", {
          users: updatedUsers,
          count: usersWithUsername.size,
        });
      }
    }
  }

  io.on("connection", (socket) => {
    console.log("User connected with socket ID:", socket.id);

    // Send existing chat history to the newly connected user
    socket.emit("chatHistory", chatHistory);

    // Send the list of users to the newly connected user
    const usersWithUsernameList = Array.from(usersWithUsername).map((id) => users.get(id));
    socket.emit("updateUsers", {
      users: usersWithUsernameList,
      count: usersWithUsername.size,
    });

    // Handle the username set by the user
    socket.on("setUsername", (username) => {
      // Check if the username is already taken
      if (Array.from(users.values()).includes(username)) {
        socket.emit("usernameError", "Username already taken");
        return;
      }

      // Set the username if it's not taken
      users.set(socket.id, username);
      usersWithUsername.add(socket.id);
      console.log("Username set:", username);

      // Set session for the user
      const sessionEndTime = Date.now() + SESSION_DURATION;
      sessions.set(socket.id, sessionEndTime);

      // Notify all clients about the updated user list
      const updatedUsers = Array.from(usersWithUsername).map((id) => users.get(id));
      io.emit("updateUsers", {
        users: updatedUsers,
        count: usersWithUsername.size,
      });

      // Notify all clients that a new user has joined
      socket.broadcast.emit("userJoined", username);

      // Notify the user of their session end time
      socket.emit("sessionEndTime", sessionEndTime);
    });

    // Handle incoming messages
    socket.on("sendMessage", (messageData) => {
      const { sender, receiver, message } = messageData;
      console.log("Message received from", sender, "to", receiver, ":", message);

      const timestamp = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const chatMessage = { sender, receiver, message, timestamp };
      chatHistory.push(chatMessage);

      io.emit("receiveMessage", chatMessage);
      console.log("Updated chat history:", chatHistory);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected with socket ID:", socket.id);
      const username = users.get(socket.id); // Get username of the disconnected user
      users.delete(socket.id);
      usersWithUsername.delete(socket.id);
      sessions.delete(socket.id); // Remove the session

      // Notify all clients about the updated user list and count of users with usernames
      const updatedUsers = Array.from(usersWithUsername).map((id) => users.get(id));
      io.emit("updateUsers", {
        users: updatedUsers,
        count: usersWithUsername.size,
      });

      // Notify all clients that a user has left
      if (username) {
        io.emit("userLeft", username);
      }

      // If no users are left, reset chat data
      if (users.size === 0) {
        resetChatData();
      }
    });

    // Handle periodic session validation
    socket.on("validateSession", () => {
      const sessionEndTime = sessions.get(socket.id);
      if (sessionEndTime && Date.now() > sessionEndTime) {
        socket.emit("sessionExpired", "Session has expired");
        users.delete(socket.id);
        usersWithUsername.delete(socket.id);
        sessions.delete(socket.id);

        // Notify all clients about the updated user list and count of users with usernames
        const updatedUsers = Array.from(usersWithUsername).map((id) => users.get(id));
        io.emit("updateUsers", {
          users: updatedUsers,
          count: usersWithUsername.size,
        });
      }
    });
  });

  // Periodically check sessions
  setInterval(checkSessions, 5 * 1000); // Check every minute
};

// Controller function to handle HTTP requests for chat history
export const getChatHistory = (req, res) => {
  console.log("Chat history requested");
  res.json(chatHistory);
};
