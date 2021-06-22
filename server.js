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
  client.getSingingKey(header.kid, function(err, key) {
    var singingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const PORT = process.env.PORT || 3001;

app.get('/test', (request, response) => {

  // TODO: 
  // STEP 1: get the jwt from the headers
  const token = request.headers.authorization.split(' ')[1];
  // STEP 2. use the jsonwebtoken library to verify that it is a valid jwt
  jwt.verify(token, getKey, {}, function(err, user) {
    if (err) {
      response.status(500).send('invalid token');
    } else {
      response.send(user);
    }
  });
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end

});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
