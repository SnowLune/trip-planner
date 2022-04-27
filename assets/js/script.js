/***************************
 * Trip Planner, script.js
 ***************************/
let keyRing = {
  position_stack: "d5f115b51ab45c474ebd586717ea58a8",
  open_weather_map: "5056fb3f5552cba986f4ea65f8eec72e",
  ticketmaster: "d6Hq0N8GnW5O3VKdZ1azVxmghFvXITUv",
};
// Body elements
var dayEventsEl = document.querySelector("article.day-events");
var navFormEl = document.getElementById("nav-form");
var locationLabel = document.getElementById("location-label");

// Search Form
var locationEl = document.getElementById("locationSearch");
var dateEl = document.getElementById("dateSearch");

async function getForecasts(lat, lon) {
  var w = new Weather(lat, lon);
  w.data = await w.pullWeather();
  w.sevenDaily = await w.data.daily;
  w.setDaily(w.sevenDaily[1]);
  return w;
}

class Weather {
  constructor(lat, lon) {
    this.lat = lat;
    this.lon = lon;
    this.data = {};
    this.sevenDaily = [];
    this.currentDaily = {};
  }

  async pullWeather(lat = this.lat, lon = this.lon) {
    if (!lat || !lon) {
      if (!lat) {
        console.error("No valid latitude passed");
      } else {
        console.error("No valid longitude passed");
      }
      return false;
    }

    const baseURL = "https://api.openweathermap.org/data/2.5/onecall";
    const params = {
      lat: "?lat=" + lat,
      lon: "&lon=" + lon,
      count: "&exclude=" + "current,minutely,hourly,alerts",
      key: "&appid=",
    };

    const requestURL =
      baseURL +
      params.lat +
      params.lon +
      params.count +
      params.key +
      keyRing.open_weather_map;

    try {
      const response = await fetch(requestURL, {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
      });
      const weatherData = await response.json();
      return weatherData;
    } catch (error) {
      console.error(error);
    }
  }

  setDaily(weatherObj) {
    this.currentDaily = {
      main: weatherObj.weather[0].main,
      low: this.toFahrenheit(weatherObj.temp.min),
      high: this.toFahrenheit(weatherObj.temp.max),
      mainIconID: weatherObj.weather[0].icon,
      mainIconURL:
        "https://openweathermap.org/img/wn/" +
        weatherObj.weather[0].icon +
        "@2x.png",
    };
  }

  toCelsius(k) {
    let c = k - 273.15;
    return Math.floor(c);
  }

  toFahrenheit(k) {
    let c = this.toCelsius(k);
    let f = c * (9 / 5) + 32;
    return Math.floor(f);
  }
}
// Event class with methods for fetching and manipulating event information
class Event {
  constructor() {
    this.data = {};
    this.eventGroup = [];
    this.key = keyRing.ticketmaster;
  }

  async pullEvents(location, date, key = this.key) {
    // create request and fetch ticketmaster api
    if (!location || !date || !key) {
      if (!location) {
        console.error(location + " is not a valid location object");
      }
      if (!date) {
        console.error(date + " is not a valid date object");
      }
      if (!key) {
        console.error("No valid API key passed.");
      }
      return false;
    }

    const baseURL = "https://app.ticketmaster.com/discovery/v2/";

    // Get date 24 hours from start date
    const datePlus = new Date(date);
    datePlus.setDate(datePlus.getDate() + 1);

    // Remove fraction of seconds because the API doesn't like them
    function toBetterISO(dateStr) {
      return dateStr.toISOString().split(".")[0] + "Z";
    }

    const params =
      "events?apikey=" +
      key +
      "&latlong=" +
      location.latitude +
      "," +
      location.longitude +
      "&radius=30&unit=miles&locale=*&startDateTime=" +
      toBetterISO(date) +
      "&endDateTime=" +
      toBetterISO(datePlus);

    var requestURL = baseURL + params;

    console.log(requestURL);

    try {
      const response = await fetch(requestURL, {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
      });
      const eventsData = await response.json();
      return eventsData;
    } catch (error) {
      console.error(error);
    }
  }
}

/**********************
 * Pull TicketMaster
 **********************/
// Takes location object, date object, and count of events to fetch
// Returns an event object
async function getEvents(location, date, count = 3) {
  if (!count) {
    console.error(count + " is not a valid number. (signed int)");
    return false;
  } else if (count < 0) {
    console.error("Count must be greater than zero");
    return false;
  }

  var e = new Event();
  e.data = await e.pullEvents(location, date);
  return e;
}

// Location class with methods for fetching and manipulating event information
class Location {
  constructor(searchTerm) {
    this.search = searchTerm;
    this.key = keyRing.position_stack;
    this.data = [];
    this.bestMatch = {};
  }

  async requestGeoData(searchTerm = this.search, key = this.key) {
    if (!searchTerm || !key) {
      !searchTerm
        ? console.error("No valid query string passed")
        : console.error("No valid API key passed");
    }

    const baseURL = "http://api.positionstack.com/v1/";
    const params =
      "forward?access_key=" +
      key +
      "&query=" +
      searchTerm +
      "&timezone_module=1" +
      "&output=json";
    var requestURL = baseURL + params;

    try {
      const response = await fetch(requestURL, {
        method: "GET",
      });
      const geoCodeData = await response.json();
      return geoCodeData;
    } catch (error) {
      console.error(error);
    }
  }

  findBestMatch(data = this.data) {
    // Find best match with search query
    var bestMatch = null;
    var altMatch = null;

    for (let i = 0; i < data.data.length; i++) {
      // current iteration location data object
      var current = data.data[i];

      // name of location actually matches a word in search term
      if (current.name.toLowerCase().includes(this.search)) {
        // prioritize US search
        if (current.country_code == "USA") {
          bestMatch = current;
        }
        // First matching outside US
        else if (!altMatch) {
          altMatch = current;
        }
      } else {
        bestMatch = data.data[0];
      }
    }
    if (!bestMatch) {
      bestMatch = altMatch;
    }
    return bestMatch;
  }
}

// Test objects for createDay()
const debug_WeatherObj = {
  high: 34,
  low: 10,
  main: "Clear",
  mainIconID: "",
  mainIconURL: "",
};
const debug_EventsArr = [
  {
    thumbnail: "",
    title: "Test Debug in Concert",
    time: "3:00pm",
    venue: "Big Concert Hall",
    description: "Test Debug lorem ipsum tour",
  },
  {
    thumbnail: "",
    title: "Test Debug 2 in Concert",
    time: "9:00pm",
    venue: "Music Place Center",
    description: "Test Debug lorem ipsum tour 2",
  },
];

/*************************************
 * Dynamic creation of day section
 *************************************/
// date: a string with the long date ex. "Thursday January 1, 1970"
// weatherObj: an object containing at least high(float), low(float),
//    main(str), mainIconID(str)
// eventsArr: an array of objects containing ticketmaster event objects
function createDay(date, weatherObj, eventsArr) {
  //
  // Create .day section
  //
  var day = document.createElement("section");
  day.className = "day flex justify-evenly bg-gray-200 m-8 p-5";

  //
  //   WEATHER
  //

  var weather = document.createElement("div");
  weather.className = "weather bg-gray-300 p-5";
  day.appendChild(weather);

  var dateHeader = document.createElement("h2");
  dateHeader.className = "event-date pb-2 font-bold";
  dateHeader.textContent = date.toDateString();
  weather.appendChild(dateHeader);

  // container for current condition icon and description
  var weatherMain = document.createElement("div");
  weatherMain.className = "weather-main";

  // the OpenWeatherMap icon associated with the weather.main id
  var weatherMainIcon = document.createElement("img");
  weatherMainIcon.className = "weather-main-icon m-auto pt-2 text-white";
  weatherMainIcon.setAttribute("src", weatherObj.currentDaily.mainIconURL);
  weatherMain.appendChild(weatherMainIcon);

  // text: "Clear", "Cloudy", etc
  var weatherMainText = document.createElement("h4");
  weatherMainText.className =
    "weather-main-text text-3xl text-center text-white";
  weatherMainText.textContent = weatherObj.currentDaily.main;
  weatherMain.appendChild(weatherMainText);

  weather.appendChild(weatherMain);

  // container for high and low temps
  var weatherTemp = document.createElement("div");
  weatherTemp.className = "weather-temp text-white";

  var weatherHigh = document.createElement("h5");
  weatherHigh.className = "weather-high text-2xl text-center";
  weatherHigh.textContent = "High: " + weatherObj.currentDaily.high;
  weatherTemp.appendChild(weatherHigh);

  var weatherLow = document.createElement("h5");
  weatherLow.className = "weather-low text-2xl text-center";
  weatherLow.textContent = "Low: " + weatherObj.currentDaily.low;
  weatherTemp.appendChild(weatherLow);

  weather.appendChild(weatherTemp);

  // append the entire weather div
  day.appendChild(weather);

  //
  //   EVENTS
  //
  var events = document.createElement("div");
  events.className = "events bg-slate-50 p-5";

  for (let i = 0; i < eventsArr.length; i++) {
    var e = {
      name: eventsArr[i].name,
      image: eventsArr[i].images[0].url,
      venue: eventsArr[i]._embedded.venues[0].name,
      time: eventsArr[i].dates.start.localTime,
      info: eventsArr[i].info,
      url: eventsArr[i].url,
    };

    var event = document.createElement("div");
    event.className = "event";

    var eventThumbnail = document.createElement("img");
    eventThumbnail.className = "event-thumbnail object-fill w-32 h-24";
    if (e.image) {
      eventThumbnail.setAttribute("src", e.image);
    }
    event.appendChild(eventThumbnail);

    var eventTitle = document.createElement("a");
    eventTitle.className = "event-title";
    eventTitle.setAttribute("href", e.url);
    eventTitle.textContent = e.name;
    event.appendChild(eventTitle);

    // container for event time and event venue
    var eventTimeVenue = document.createElement("p");
    eventTimeVenue.className = "event-time-and-venue flex flex-col";
    // event time
    var eventTime = document.createElement("span");
    eventTime.className = "event-time";
    if (e.time) {
      eventTime.textContent = e.time;
    }
    eventTimeVenue.appendChild(eventTime);
    // event venue
    var eventVenue = document.createElement("span");
    eventVenue.className = "event-venue";
    if (e.venue) {
      eventVenue.textContent = e.venue;
    }
    eventTimeVenue.appendChild(eventVenue);

    event.appendChild(eventTimeVenue);

    // paragraph describing the event from TicketMaster api
    var eventDescription = document.createElement("p");
    eventDescription.className = "event-description";
    if (e.info) {
      eventDescription.textContent = e.info;
    }

    event.appendChild(eventDescription);

    events.appendChild(event);
  }

  day.appendChild(events);

  dayEventsEl.appendChild(day);
}

async function submitHandler(event) {
  event.preventDefault();
  // Remove existing '.day' elements and reset location-label
  const dayEls = document.querySelectorAll(".day-events *");
  dayEls.forEach((dayEl) => {
    dayEl.remove();
  });
  locationLabel.textContent = "";

  // Get geocoding data from PositionStack
  var l = new Location(locationEl.value);
  l.data = await l.requestGeoData();
  l.bestMatch = l.findBestMatch();
  console.log(l.bestMatch);

  // Set location-label to our bestMatch location
  locationLabel.textContent = l.bestMatch.label;

  // Set timezone and create new Date object
  var timezoneOffset = l.bestMatch.timezone_module.offset_string;
  var d = new Date(dateEl.value + "T00:00:00" + timezoneOffset);

  var w = await getForecasts(l.bestMatch.latitude, l.bestMatch.longitude);
  console.log(w);

  // Create 3 '.day' sections
  var day = d;
  var forecastAdvance = 0;
  for (let i = 0; i < 3; i++) {
    var dayNext = new Date(day);
    dayNext.setDate(dayNext.getDate() + 1);

    // Get Weather
    w.setDaily(w.sevenDaily[forecastAdvance]);

    // Get Events
    var todaysEvents = await getEvents(l.bestMatch, day);

    // Break if we don't find any events this day
    if (todaysEvents.data.page.totalElements > 0) {
      var eventCount = 3;
      if (todaysEvents.data._embedded.events.length < eventCount) {
        eventCount = todaysEvents.data._embedded.events.length;
      }

      for (let j = 0; j < eventCount; j++) {
        var event = todaysEvents.data._embedded.events[j];
        if (event) {
          todaysEvents.eventGroup.push(event);
        } else {
          break;
        }
      }
    }

    createDay(day, w, todaysEvents.eventGroup);

    // Increment day
    day = dayNext;
    forecastAdvance = i + 1;
  }
}

navFormEl.addEventListener("submit", submitHandler);

window.onload = () => {
  var today = new Date();
  today = today.toISOString().split("T")[0];
  dateEl.value = today;
  dateEl.setAttribute("min", today);
};
