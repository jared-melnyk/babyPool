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
    babyLength: Number,
    babyWeight: {
      pounds: Number,
      ounces: Number
    },
    babySex: String
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
        res.render("guesses", {allGuesses: allGuesses});
    }
  });
});

app.post("/guesses", function(req, res) {
  Guess.countDocuments({guesserEmail: req.body.guesserEmail}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
  
  let d = new Date(req.body.birthDate);
  let displayDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
  console.log(displayDate);
  let newGuess = {
    guesserName: req.body.guesserName,
    guesserEmail: req.body.guesserEmail,
    birthDate: displayDate,
    babyLength: req.body.babyLength,
    babyWeight: {
      pounds: req.body.babyWeightPounds,
      ounces: req.body.babyWeightOunces
    },
    babySex: req.body.babySex
  }
  console.log(newGuess);
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