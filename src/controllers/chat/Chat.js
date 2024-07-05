import crypto from "crypto";
import moment from "moment-timezone";

const chatHistory = []; // In-memory array to store chat messages
const users = new Map(); // Map to store socket IDs and usernames
const usersWithUsername = new Set(); // Set to store socket IDs of users with usernames
let sessionEndTime = null; // Variable to store session end time

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour session duration in milliseconds
const ENCRYPTION_KEY = crypto.randomBytes(32); // Generate a random encryption key (should be kept secret)
const IV_LENGTH = 16; // Length of initialization vector for AES

// Function to encrypt a message
function encryptMessage(message) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(message);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Function to decrypt a message
function decryptMessage(encryptedMessage) {
  const textParts = encryptedMessage.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const manageChat = (io) => {
  // Function to check and reset the session if necessary
  function checkSessionExpiration() {
    if (sessionEndTime && Date.now() >= sessionEndTime) {
      io.emit("sessionExpired", "Session has expired");
      resetSession(); // Optional: Clear session data if desired
    } else if (sessionEndTime) {
      const timeRemaining = Math.max(sessionEndTime - Date.now(), 0);
      io.emit("timeRemaining", timeRemaining);
    }
  }

  // Function to reset the session data
  function resetSession() {
    chatHistory.length = 0; // Clear chat history
    users.clear(); // Clear users
    usersWithUsername.clear(); // Clear usernames
    sessionEndTime = null; // Reset session end time
    io.emit("chatHistory", []); // Notify clients with empty chat history
    io.emit("updateUsers", {
      users: [],
      count: 0,
    }); // Notify clients
  }

  io.on("connection", (socket) => {
    // Send existing chat history to the newly connected user
    socket.emit(
      "chatHistory",
      chatHistory.map((message) => ({
        ...message,
        message: decryptMessage(message.message), // Decrypt messages before sending to client
      }))
    );

    // Send the list of users and the number of users with usernames to the newly connected user
    const currentUsers = Array.from(users.values());
    const usersWithUsernameList = Array.from(usersWithUsername).map((id) =>
      users.get(id)
    );
    socket.emit("updateUsers", {
      users: usersWithUsernameList,
      count:
        usersWithUsername.size - (usersWithUsername.has(socket.id) ? 1 : 0),
    });

    // Send the time remaining for the session
    if (sessionEndTime) {
      const timeRemaining = Math.max(sessionEndTime - Date.now(), 0);
      socket.emit("timeRemaining", timeRemaining);
    }

    // Handle the username set by the user
    socket.on("setUsername", (username) => {
      // Check if the username is already taken
      if (Array.from(users.values()).includes(username)) {
        socket.emit("usernameError", "Username sudah digunakan");
        return;
      }

      // Set the username if it's not taken
      users.set(socket.id, username);
      usersWithUsername.add(socket.id);
      console.log("Username set:", username);

      // Notify all clients about the updated user list and count of users with usernames
      const updatedUsers = Array.from(usersWithUsername).map((id) =>
        users.get(id)
      );
      io.emit("updateUsers", {
        users: updatedUsers,
        count:
          usersWithUsername.size - (usersWithUsername.has(socket.id) ? 1 : 0),
      });

      // Notify all clients that a new user has joined
      socket.broadcast.emit("userJoined", username);

      // Set or reset the session end time
      if (!sessionEndTime || sessionEndTime < Date.now()) {
        sessionEndTime = Date.now() + SESSION_DURATION;
        io.emit("timeRemaining", SESSION_DURATION); // Notify all clients
      }
    });

    // Log when a message is received and broadcasted
    socket.on("sendMessage", (messageData) => {
      const { sender, receiver, message } = messageData;
      console.log(
        "Message received from",
        sender,
        "to",
        receiver,
        ":",
        message
      );

      // Encrypt the message
      const encryptedMessage = encryptMessage(message);

      // Format timestamp in Indonesian time format (24-hour, Jakarta timezone)
      const timestamp = moment().tz("Asia/Jakarta").format("HH:mm");

      // Store the message in chat history
      const chatMessage = {
        sender,
        receiver,
        message: encryptedMessage, // Store encrypted message
        timestamp, // Add formatted timestamp
      };
      chatHistory.push(chatMessage);

      // Broadcast the message to all clients
      io.emit("receiveMessage", {
        ...chatMessage,
        message: message, // Send the plain message to clients
      });

      // Log the updated chat history
      console.log("Updated chat history:", chatHistory);
    });

    // Handle user typing event
    socket.on("typing", () => {
      const username = users.get(socket.id);
      if (username) {
        socket.broadcast.emit("userTyping", username);
      }
    });

    // Handle user stop typing event
    socket.on("stopTyping", () => {
      const username = users.get(socket.id);
      if (username) {
        socket.broadcast.emit("userStopTyping", username);
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected with socket ID:", socket.id);
      const username = users.get(socket.id); // Get username of the disconnected user
      users.delete(socket.id);
      usersWithUsername.delete(socket.id);

      // Notify all clients about the updated user list and count of users with usernames
      const updatedUsers = Array.from(usersWithUsername).map((id) =>
        users.get(id)
      );
      io.emit("updateUsers", {
        users: updatedUsers,
        count:
          usersWithUsername.size - (usersWithUsername.has(socket.id) ? 1 : 0),
      });

      // Notify all clients that a user has left
      if (username) {
        io.emit("userLeft", username); // Send the username of the user who left
      }

      // Optionally check session expiration
      checkSessionExpiration();
    });

    // Periodically check for session expiration
    setInterval(() => {
      checkSessionExpiration();
    }, 1000); // Check every second
  });
};

// Controller function to handle HTTP requests for chat history
export const getChatHistory = (req, res) => {
  res.json(chatHistory.map(message => ({
    ...message,
    message: decryptMessage(message.message), // Decrypt messages before sending to client
  })));
};
