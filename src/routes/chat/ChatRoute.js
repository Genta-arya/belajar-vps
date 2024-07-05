// src/routes/ChatRoute.js
import express from 'express';
import { getChatHistory } from '../../controllers/chat/Chat.js';
// Import any necessary controllers here

const routerChat = express.Router();

// Define any HTTP endpoints related to chat here
routerChat.get('/chat', getChatHistory);

export default routerChat;
