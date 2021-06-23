'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();
app.use(cors());

const client = jwksClient({
  jwksUri: 'https://dev-3puoq3b1.us.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MONGO ONLINE')
});

const Book = require('./models/Book');

// let goodBook = new Book({
//   name: 'World War Z',
//   description: 'Better than the movie',
//   status: 'read',
//   email: 'q.hashi16@gmail.com'
// })

// goodBook.save( (err, bookDataFromMongo) => {
//   console.log('book saved')
//   console.log(bookDataFromMongo);
// });

const PORT = process.env.PORT || 3001;

// app.get('/*', (req, res) => {
//   console.log('HELLO THERE')
// })

app.get('/books', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, getKey, {}, function(err, user) {
    if(err) {
      res.status(500).send('invalid token');
    } else {
      let userEmail = user.email;
      Book.find({email: userEmail}, (err, books) => {
        console.log(books);
        res.send(books);
      });
    }
  });
});

app.get('/test', (request, response) => {
  const token = request.headers.authorization.split(' ')[1];

  jwt.verify(token, getKey, {}, function(err, user) {
    if (err) {
      response.status(500).send('invalid token');
    } else {
      response.send(user);
    }
  });
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
