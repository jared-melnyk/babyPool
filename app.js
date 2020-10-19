const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
let tools = require("./tools");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

const mongoose = require("mongoose");
const { query } = require("express");
const uri = process.env.MONGODB_URL_BABYAPP;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

let conn = mongoose.connection;
conn.on('connected', () => {
    console.log("Mongoose is connected!");
});

let GuessSchema = new mongoose.Schema({
    guesserName: String,
    guesserEmail: String,
    birthDate: Date,
    birthTime: Date,
    babyLength: Number,
    babyWeight: {
      pounds: Number,
      ounces: Number
    },
    babySex: String,
    birthdateRank: Number,
    lengthRank: Number,
    weightRank: Number,
    sexRank: Number,
    rankPoints: Number,
    totalRank: Number
}, {minimize:false});

let Guess = mongoose.model("Guess", GuessSchema);

app.get("/", function(req, res) {
    res.redirect("/guesses");
});

app.get("/submitGuess", function(req, res) {
  res.render("submitGuess");
});

app.get("/guesses", function(req, res) {
  // Get all guesses from DB
  Guess.find({}).sort({birthDate: 1}).exec(function(err, allGuesses) {
    if(err){
        console.log(err);
    } else {
      Guess.find({}).sort({totalRank: 1}).exec(function(err, allRanks) {
        if(err){
            console.log(err);
        } else {
            res.render("guesses", {allGuesses: allGuesses, allRanks: allRanks});
        }
      });  
    }
  });
});

app.get("/results", function(req, res) {
  // Get all guesses from DB
  Guess.find({}).sort({birthDate: 1}).exec(function(err, allGuesses) {
    if(err){
        console.log(err);
    } else {
      Guess.find({}).sort({totalRank: 1}).exec(function(err, allRanks) {
        if(err){
            console.log(err);
        } else {
            res.render("results", {allGuesses: allGuesses, allRanks: allRanks});
        }
      });  
    }
  });
});

app.post("/guesses", function(req, res) {
  let birthTime = new Date(req.body.birthDate + " " + req.body.birthTime);
  let birthDate = new Date(req.body.birthDate + " " + req.body.birthTime);
  let newGuess = {
    guesserName: req.body.guesserName,
    guesserEmail: req.body.guesserEmail,
    birthDate: birthDate,
    birthTime: birthTime,
    babyLength: req.body.babyLength,
    babyWeight: {
      pounds: req.body.babyWeightPounds,
      ounces: req.body.babyWeightOunces
    },
    babySex: req.body.babySex
  }
  Guess.findOneAndUpdate(
    {guesserEmail: req.body.guesserEmail}, 
    {$set: newGuess}, 
    {upsert: true},  
    function(err, guess){
      if(err){
        console.log(err);
      } else {
        res.redirect("/guesses?newGuess=true");
      }
  });
});

let port = process.env.PORT || 8080;
app.listen(port);