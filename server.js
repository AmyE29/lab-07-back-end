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
app.get('/trails', trailsHandler);
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
  console.log(url);
  superagent.get(url)
    .then ( weatherData => {
      const weatherSummaries = [];
      console.log(weatherSummaries);
      weatherData.body.daily.data.forEach( (day) => {
        weatherSummaries.push( new Weather (day) );
      });
      response.status(200).json(weatherSummaries);
    })
    .catch( error => errorHandler(error, request, response) ); 
 }
function Weather(day){
  this.forecast = day.summary;
  this.time = new Date( day.time * 1000).toString().slice(0,15);
}

function trailsHandler(request, response) {
  const url =`https://www.hikingproject.com/data/get-trails/${request.query.data.latitude}, ${request.query,data.longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`
  console.log(url);
  superagent.get(url)
  .then(data => {
    console.log(request.query.data);
    console.log(data.body);
    let trailData = new Trail (request.query.data, data.body);
    console.log(trailData);
    response.status(200).json(trailData);
  })
  .catch(error => errorHandler(error, request, response));
}

function Trail (city, location) {
this.search_query = city;
this.formatted_query = location.trail[0].name;
this.location = location.trail[0].location;
this.length = location.trail[0].length;
this.stars = location.trail[0].stars;
this.star_votes = location.trail[0].star_votes;
this.summary = location.trail[0].summary;
this.trail_url = location.trail[0].trail_url;
this.conditions = location.trail[0].conditions;
this.condition_date = location.trail[0].condition_date;
this.condition_time = location.trail[0].condition_time;
}

function trailsHandler(request, response) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${request.query.data.latitude}&lon=${request.query.data.longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;
  superagent.get(url)
    .then(data => {
      const trailData = data.body.trails.map(location => {
        return new Trail(location);
      });
      response.status(200).json(trailData);
    })
    .catch(error => errorHandler(error, request, response));
  }
  function Trail (location) {
  this.name = location.name;
  this.location = location.location;
  this.length = location.length;
  this.stars = location.stars;
  this.star_votes = location.starVotes;
  this.summary = location.summary;
  this.trail_url = location.url;
  this.conditions = location.conditionStatus;
  this.condition_date = location.conditionDate;
  this.condition_time = location.conditionTime;
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


// https://www.eventbriteapi.com/v3/users/me/?token=EVENT_API_KEY

// https://api.yelp.com/v3/autocomplete?text=del&latitude=37.786882&longitude=-122.399972
