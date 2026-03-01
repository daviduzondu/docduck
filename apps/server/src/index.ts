import 'dotenv/config';
import express from "express";
import cors from 'cors';
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const corsConfig: cors.CorsOptions = {
 credentials: true,
 origin: ['http://localhost:3000']
}
const PORT = process.env.PORT ?? "1711";

const io = new Server(server, {
 cors: corsConfig
});


io.on('connection', (socket) => {
 console.log("New client connected!");
});

app.use(cors(corsConfig));

app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));
server.listen(PORT, () => console.log(`Server now listening on ${PORT}`));