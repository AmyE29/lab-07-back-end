'use strict';
// npm packages
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

//application constant
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);


function locationHandler (request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.LOCATION_API_KEY}`;
  console.log(url);
  // const geoData = require('./data/geo.json');
  superagent.get(url)
    .then(data => {
      console.log(request.query.data);
      console.log(data.body);
      let locationData = new Location(request.query.data, data.body);
      console.log(locationData);
      response.status(200).json(locationData);
    })
    .catch(error => errorHandler(error, request, response));
 }

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;

}

function weatherHandler(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  superagent.get(url)
    .then ( weatherData => {
      const weatherSummaries = [];
      weatherData.body.daily.data.forEach( (day) => {
        weatherSummaries.push( new Weather (day) );
      });
      response.status(200).json(weatherSummaries);
    })
    .catch( error => errorHandler(error, request, response) );
 }
function Weather(day){
  this.forcast = day.summary;
  this.time = new Date( day.time * 1000).toString().slice(0,15);
}


function notFoundHandler(request, response) {
  response.status(404).send('not found');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}


app.listen(PORT, () =>{
  console.log(`listening to PORT ${PORT}`);
});
