import express from 'express';
import AuthRouters from './src/routes/Auth/AuthRoute.js';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const port = 3000;
const httpserver = createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Define a simple route that returns JSON data
app.get('/api/v1/data', (req, res) => {
    const sampleData = {
        message: "Hello, world!",
        status: "success",
        data: {
            id: 1,
            name: "Sample Item",
            description: "This is a sample item description."
        }
    };
    res.json(sampleData);
});

// Use AuthRouters for authentication routes
app.use('/api/v1/auth', AuthRouters);

// Start the server
httpserver.listen(port, () => {
    console.log('Server running on port ' + port);
});
