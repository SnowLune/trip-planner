var searchField = document.querySelector("#locationSearch");
var searchBtn = document.querySelector("#findEventBtn");
var ForecastContainer = document.querySelector(".weather-main");
var dayEvents = document.querySelector("article.day-events");
var navForm = document.getElementById("nav-form");

// Search Form
var locationEl = document.getElementById("locationSearch");
var dateEl = document.getElementById("dateSearch");

var apiKey = "5056fb3f5552cba986f4ea65f8eec72e";

function getCordinates(city) {
   var baseUrl = "http://api.openweathermap.org/geo/1.0/direct?q=";
   var restUrl = "&limit=1&appid=5056fb3f5552cba986f4ea65f8eec72e";
   //Make a request to the url
   fetch(baseUrl + city + restUrl).then(function (response) {
      //request was successful
      response.json().then(function (data) {
         console.log(data);
         //displayCordinates(data)
         getCurrent(data[0].lat, data[0].lon);
         displayCityName(data[0].name, data[0].state);
         getForecast(data[0].lat, data[0].lon);
      });
   });
}
//create a span element to hold searched city names
//var titleEl = document.createElement("span");

//titleEl.textContent = (cityName);

//https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
function getCurrent(lat, lon) {
   var baseUrl = "https://api.openweathermap.org/data/2.5/onecall?";
   var getLatLon = "lat=" + lat + "&lon=" + lon;
   var restUrl = "&units=imperial&exclude=minutely,hourly,daily,alerts&appid=";
   fetch(baseUrl + getLatLon + restUrl + apiKey).then(function (response) {
      //request was successful
      response.json().then(function (data) {
         console.log(data);
         //displayCordinates(data)
         displayCurrent(data);
      });
   });
}

function getForecast(lat, lon) {
   var baseUrl = "https://api.openweathermap.org/data/2.5/onecall?";
   var getLatLon = "lat=" + lat + "&lon=" + lon;
   var restUrl =
      "&units=imperial&exclude=minutely,hourly,current,alerts&appid=";
   fetch(baseUrl + getLatLon + restUrl + apiKey).then(function (response) {
      //request was successful
      response.json().then(function (data) {
         console.log(data);
         //displayCordinates(data)
      });
   });
}
//for loop for five day forecast
function getForecast (data) {
   var today = moment();
   for (var i = 1; i<6; i++) 
      console.log(data[i]);
}
var currentContainer = document.querySelector(".day-events");
function displayCurrent(data) {
   var currentTemp = document.querySelector(".current-temp");
   currentTemp.textContent = "Temperature: " + data.current.temp + "°F";
   var currentHumid = document.querySelector(".current-humidity");
   currentHumid.textContent = "Humidity: " + data.current.humidity + "%";
   var currentWind = document.querySelector(".current-windspeed");
   currentWind.textContent = "Windspeed: " + data.current.wind_speed + " MPH";
   var currentUvi = document.querySelector(".current-uvi");
   currentUvi.textContent = "Uvi: " + data.current.uvi;
   currentContainer.appendChild(currentTemp);
   currentContainer.appendChild(currentHumid);
   currentContainer.appendChild(currentWind);
   currentContainer.appendChild(currentUvi);
}

function displayCityName(city, state) {
   var cityNameEl = document.querySelector(".cityname");
   cityNameEl.textContent = city + ", " + state;
}

function displayDate() {
   var date = moment().format("MMMM Do YYYY");
   console.log(date);
   var dateEl = document.querySelector(".date");
   dateEl.textContent = date;
}

class Location {
   constructor(searchTerm) {
      this.search = searchTerm;
      this.key = keyRing.position_stack;
      this.data = [];
      this.bestMatch = {};
   }

   async requestGeoData(searchTerm = this.search, key = this.key) {

      if (!searchTerm || !key) {
   
         !searchTerm ? console.error("No valid query string passed")
            : console.error("No valid API key passed");
      }
   
      const baseURL = "http://api.positionstack.com/v1/"
      const param = "forward?access_key=" + key + "&query=" + searchTerm +
            "&timezone_module=1" + "&output=json";
      var requestURL = baseURL + param;
      
      try {
         const response = await fetch(requestURL, {
            method: 'GET'
         });
         const geoCodeData = await response.json();
         // console.log(geoCodeData);
         return geoCodeData;
      }
      catch (error) {
         console.error(error);
      }
   }

   findBestMatch(data = this.data) {
      // Last word of search query to match against name
      if (this.search.includes(" ")) {
         var queryLastWord = this.search.split(" ").pop().toLowerCase();
      }
      else {
         var queryLastWord = this.search;
      }

      // Find best match with search query
      var bestMatch = null;
      var altMatch = null;

      for (let i = 0; i < data.data.length; i++) {
         
         // current iteration location data object
         var current = data.data[i];

         // name of location actually matches a word in search term
         if (current.name
            .toLowerCase()
            .includes(queryLastWord)
         ) {
            // prioritize US search
            if (current.country_code == "USA") {
               bestMatch = current;
            }
            // First matching outside US
            else if (!altMatch) {
               altMatch = current;
            }
         }
         else {
            bestMatch = data.data[0];
         }
      }
      if (!bestMatch) {
         bestMatch = altMatch;
      }
      return bestMatch;
   }
}

async function submitHandler(event) {
   event.preventDefault();

   // Get geocoding data from PositionStack
   var l = new Location(locationEl.value);
   l.data = await l.requestGeoData();
   l.bestMatch = l.findBestMatch();
   console.log(l.bestMatch.timezone_module.offset_string);
   // Parse Date
   var timezoneOffset = "-0500";
   let d = new Date(dateEl.value + "T00:00:00" + l.bestMatch.timezone_module.offset_string);
   
   // console.dir(d);
}

// Test objects for createDay()
const debug_WeatherObj = {
   high: 34,
   low: 10,
   main: "Clear",
   mainIconID: "",
   mainIconURL: ""
};
const debug_EventsArr = [{
   thumbnail: "",
   title: "Test Debug in Concert",
   time: "3:00pm",
   venue: "Big Concert Hall",
   description: "Test Debug lorem ipsum tour"
},
{
   thumbnail: "",
   title: "Test Debug 2 in Concert",
   time: "9:00pm",
   venue: "Music Place Center",
   description: "Test Debug lorem ipsum tour 2"
}];

/************************************* 
 * Dynamic creation of day section
 *************************************/
// date: a string with the long date ex. "Thursday January 1, 1970"
// weatherObj: an object containing at least high(float), low(float), 
//    main(str), mainIconID(str)
// eventsArr: an array of objects containing
function createDay(date, weatherObj, eventsArr) {
   var day = document.createElement("section");
      day.className = ('day', 'flex', 'justify-center', 'bg-gray-200', 'm-8', 'p-5');

   var weatherContainer = document.createElement('div');
      weatherContainer.className = ('bg-gray-300', 'p-5');
      day.appendChild(weatherContainer);

   var dateHeader = document.createElement("h2");
      dateHeader.className = ('event-date', 'pb-2', 'font-bold');
      dateHeader.textContent = date;
      weatherContainer.appendChild(dateHeader);

   //
   //   WEATHER
   //
   var weather = document.createElement("div");
      weather.className = "weather";
      weatherContainer.appendChild(weather);

   // container for current condition icon and description
   var weatherMain = document.createElement("div");
      weatherMain.className = "weather-main";
      // append child for this element is on line 229

   // the OpenWeatherMap icon associated with the weather.main id
   var weatherMainIcon = document.createElement("img");
   weatherMainIcon.className = "weather-main-icon";
   weatherMainIcon.setAttribute("src", weatherObj.mainIconURL);
   //"https://openweathermap.org/img/wn/" + weatherObj.mainIconID + "@2x.png");
   weatherMain.appendChild(weatherMainIcon);

   // text: "Clear", "Cloudy", "Tstorms", etc
   var weatherMainText = document.createElement("p");
   weatherMainText.className = "weather-main-text";
   weatherMainText.textContent = weatherObj.main;
   weatherMain.appendChild(weatherMainText);

   weather.appendChild(weatherMain);

   // container for high and low temps
   var weatherTemp = document.createElement("div");
   weatherTemp.className = "weather-temp";

   var weatherHigh = document.createElement("p");
   weatherHigh.className = "weather-high";
   weatherHigh.textContent = weatherObj.high;
   weatherTemp.appendChild(weatherHigh);

   var weatherLow = document.createElement("p");
   weatherLow.className = "weather-low";
   weatherLow.textContent = weatherObj.low;
   weatherTemp.appendChild(weatherLow);
   
   weather.appendChild(weatherTemp);
   
   // append the entire weather div
   weatherContainer.appendChild(weather);

   //
   //   EVENTS
   //
var eventContainer = document.createElement("div");
   eventContainer.className = ('bg-slate-50', 'p-5');
   // append child for this element is on line #

var events = document.createElement("div");
   events.className = "events";

   for (let i = 0; i < eventsArr.length; i++) {
      var event = document.createElement("div");
      event.className = "event";

      var eventThumbnail = document.createElement("img");
      eventThumbnail.className = "event-thumbnail";
      eventThumbnail.setAttribute("src", eventsArr[i].thumbnail);
      event.appendChild(eventThumbnail);

      var eventTitle = document.createElement("p");
      eventTitle.className = "event-title";
      eventTitle.textContent = eventsArr[i].title;
      event.appendChild(eventTitle);

      // container for event time and event venue
      var eventTimeVenue = document.createElement("p");
      eventTimeVenue.className = "event-time-and-venue";
      // event time
      var eventTime = document.createElement("span");
      eventTime.className = "event-time";
      eventTime.textContent = eventsArr[i].time;
      eventTimeVenue.appendChild(eventTime);
      // event venue
      var eventVenue = document.createElement("span");
      eventVenue.className = "event-venue";
      eventVenue.textContent = eventsArr[i].venue;
      eventTimeVenue.appendChild(eventVenue);

      event.appendChild(eventTimeVenue);

      // paragraph describing the event from TicketMaster api
      var eventDescription = document.createElement("p");
      eventDescription.className = "event-description";
      eventDescription.textContent = eventsArr[i].description;

      event.appendChild(eventDescription);

      events.appendChild(event);
   }

   eventContainer.appendChild(events);

   dayEvents.appendChild(eventContainer);
}

navForm.addEventListener("submit", submitHandler);
// displayDate()

// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

window.onload = () => {
   var today = new Date();
   today = today.toISOString().split("T")[0];
   dateEl.value = today;
   dateEl.setAttribute("min", today);
}
