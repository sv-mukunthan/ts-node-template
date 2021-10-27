import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import uuid from 'node-uuid';
import fs from 'fs';
import path from 'path';
import fileUpload from 'express-fileupload';
import socketIo from "socket.io";
import Logger from './helpers/logger.helper';
import authRoute from './routes/v1/auth.route';
import connectDB from './db';

// create server
const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

function assignId (req, res, next) {
  req.id = uuid.v4()
  next()
}

// config dotenv
dotenv.config();

//Init logger
Logger();

// connect mongoose
connectDB();

app.set('view engine', 'ejs');

//BodyParser
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// set mongoose as global
mongoose.Promise  = global.Promise;


//To enable Cross-Origin Resource Sharing
let domain = "*"
if(process.env.NODE_ENV === "dev"){
  domain = "*"
}
app.use(cors({
  origin: domain
}));

// morgan logger
if(process.env.NODE_ENV === "dev") {
  app.use(morgan(':url - :status - :res[content-length] Bytes - :response-time ms - :referrer'))
} else {
  app.use(assignId)
  app.use(morgan(':url - :status - :res[content-length] Bytes - :response-time ms - :referrer',{
    stream: fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' })
  }))
}

// fileUpload
app.use(fileUpload());

// routes
app.use('/api/v1/auth', authRoute);

//Error Handling
app.use(function(err, req, res, next){
  if(process.env.NODE_ENV === "production"){
    res.status(500).send({ desc: err.desc || "Something Went Wrong" });
    // logger.error(JSON.stringify(log));
  }else{
    res.status(500).send({ desc: err.desc, stack: err.stack, message: err.message });
  }
});

export default server;
