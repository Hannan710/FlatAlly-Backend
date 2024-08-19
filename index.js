const Express = require('express');
var cors = require('cors');
const App = Express();
App.use(Express.json());
App.use(cors());

let cookieParser = require('cookie-parser');

const { logger, errorHandler } = require('./middleWare/logger');
const verifyJWT = require('./middleWare/verifyJWT');

//^thing we require for Backend other then routs 

const Mongoose = require("mongoose");
// const url = "mongodb://127.0.0.1/FlatAlly";
const url = "mongodb+srv://hannantahir14:Bunny71099@flatally.qu6dd76.mongodb.net/";

Mongoose.connect(url, { useNewUrlParser: true });
const Mongo = Mongoose.connection;

Mongo.on("open", () => {
  console.log("MongoDB Connected!");
});


App.use(cookieParser());

App.use(logger);

App.get('/api', (req, res) => {
  res.send('Hello, This is React Backend!');
});

App.use('/images', Express.static('images'))

App.use("/api/HomePageSetting", require('./Route/HomePageSetting'));

App.use("/api/area", require('./Route/area'));

App.use("/api/Register", require('./Route/Register'));

//User Authentication
App.use("/api/Login", require('./Route/auth/auth'));

App.use("/api/logout", require('./Route/auth/logout'));

App.use("/api/refresh", require('./Route/auth/refresh'));

App.use('/api/zoom', require('./Route/zoom'));

App.use('/api/zoomAPI', require('./Route/zoomAPI'));

App.use('/api/OTPMailer', require('./Route/OTPMailer'));

// App.use("/api/refresh", require('./Route/auth/refresh'));
App.use(verifyJWT);

App.use("/api/Profile", require('./Route/Profile'));

App.get('/api/JWTTest', (req, res) => {
  res.send('Hello, This is React Backend!');
});

App.use("/api/Reviews", require('./Route/Reviews'));

App.use("/api/Preferences", require('./Route/Preferences'));

App.use("/api/Flat", require('./Route/Flat'));

App.use('/api/match', require('./Route/MatchAlgo'));

App.use('/api/matchV2', require('./Route/MatchAlgoV2'));

// for unknown API address 
App.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('json')) {
    res.json({ "error": "404 Not Found" });
  } else {
    res.type('txt').send("404 Not Found");
  }
});


App.use(errorHandler);


const port = process.env.PORT || 7000;
App.listen(port, () => {
  console.log("Server Running on port:", port);
});