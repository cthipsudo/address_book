/* eslint-disable quotes */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuid } = require('uuid');


const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

const addresses = [
  {
    "id": "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    "firstName": "Sally",
    "lastName": "Bobby",
    "address1": "some Address",
    "address2": "some Address",
    "city": "New York City",
    "state": "New York",
    "zip": "true"
  },
  {
    "id": "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    "firstName": "Sammy",
    "lastName": "Bobby",
    "address1": "some Address",
    "address2": "some Address",
    "city": "Austin",
    "state": "Texas",
    "zip": "79108"
  },
];

function validateBearerToken(req, res) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');
  // console.log(apiToken);
  // console.log(authToken);
  //console.log('validate bearer token middleware');

  if (!authToken || authToken !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  // next();
}

app.get('/address', (req, res) => {
  res.json(addresses);
});

app.post('/address', (req, res) => {
  validateBearerToken(req, res);
  // get the data
  const { firstName, lastName, address1, address2 = null, city, state, zip } = req.body;

  // validation code here
  if (!firstName) {
    return res
      .status(400)
      .send('firstName required');
  }

  if(!lastName){
    return res.status(400).send('lastName required');
  }

  if(!address1){
    return res.status(400).send('An address is required');
  }

  if(!city){
    return res.status(400).send('A city is required');
  }

  if(!state){
    return res.status(400).send('A state is required');
  }

  if(!zip){
    return res.status(400).send('A state is required');
  }

  // Check if state is 2 characters
  if (state.length < 2 || state.length > 2 ) {
    return res
      .status(400)
      .send('State must be Abrev. (Exactly two characters)');
  }
  
  //Check if zip has 5 digits and checks if its a number
  
  if(!zip.length === 5){
    return res.status(400).send('Zip must be a 5 digit number');
  }
  for(let i = 0; i < zip.length; i++){
    const properZipNumber = parseInt(zip[i]);
    if(Number.isNaN(properZipNumber)){
      return res.status(400).send('Zip must be all numbers');
    }
  }

  const id = uuid();
  const newAddress = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip
  };

  addresses.push(newAddress);
  //Response with 201 Content Created, location, and the user object
  res.status(201).location(`http://localhost:8000/user/${id}`).json(newAddress);
});

app.delete('/address/:addressId', validateBearerToken, (req, res) => {
  const { addressId } = req.params;

  const index = addresses.findIndex(u => u.id === addressId);

  // make sure we actually find a user with that id
  if (index === -1) {
    return res
      .status(404)
      .send('User not found');
  }

  addresses.splice(index, 1);

  // res.send('Deleted');
  res.status(204).end();
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;