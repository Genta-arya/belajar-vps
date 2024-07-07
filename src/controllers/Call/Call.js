import { Server as SocketIOServer } from 'socket.io';

// Inisialisasi daftar pengguna yang terhubung
const users = new Map();
const ongoingCalls = new Map(); // Menyimpan status panggilan yang sedang berlangsung

export const HandleCall = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle user setting username
    socket.on('set-username', (username) => {
      users.set(socket.id, username);
      io.emit('update-users', Array.from(users.values()));
      console.log(`User set: ${username}`);
    });

    // Handle call requests
    socket.on('call-user', ({ to, offer }) => {
      const toSocketId = [...users.keys()].find(id => users.get(id) === to);
      if (toSocketId) {
        ongoingCalls.set(socket.id, toSocketId);
        ongoingCalls.set(toSocketId, socket.id);
        socket.to(toSocketId).emit('incoming-call', { from: users.get(socket.id), offer });
        console.log(`Call started: ${users.get(socket.id)} -> ${to}`);
      }
    });

    // Handle call answers
    socket.on('answer-call', ({ to, answer }) => {
      const toSocketId = [...users.keys()].find(id => users.get(id) === to);
      if (toSocketId) {
        socket.to(toSocketId).emit('call-accepted', { from: users.get(socket.id), answer });
        console.log(`Call answered: ${users.get(socket.id)} -> ${to}`);
      }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (candidate) => {
      const toSocketId = ongoingCalls.get(socket.id);
      if (toSocketId) {
        socket.to(toSocketId).emit('ice-candidate', candidate);
        console.log(`ICE candidate forwarded from ${users.get(socket.id)} to ${users.get(toSocketId)}`);
      }
    });

    // Handle ending a call
    socket.on('end-call', () => {
      const toSocketId = ongoingCalls.get(socket.id);
      if (toSocketId) {
        socket.to(toSocketId).emit('call-ended');
        console.log(`Call ended: ${users.get(socket.id)} -> ${users.get(toSocketId)}`);
        ongoingCalls.delete(toSocketId);
        ongoingCalls.delete(socket.id);
      }
    });

    // Handle user disconnect
    const handleDisconnect = () => {
      const username = users.get(socket.id);
      users.delete(socket.id);
      io.emit('update-users', Array.from(users.values()));

      // Notify users in ongoing calls
      const toSocketId = ongoingCalls.get(socket.id);
      if (toSocketId) {
        socket.to(toSocketId).emit('user-disconnected', { username });
        console.log(`User disconnected: ${username} (call with ${users.get(toSocketId)})`);
        ongoingCalls.delete(toSocketId);
        ongoingCalls.delete(socket.id);
      }
    };

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      handleDisconnect();
    });

    socket.on('user-disconnect', handleDisconnect);
  });
};
