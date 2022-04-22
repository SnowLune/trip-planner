var searchField =document.querySelector(".location-search");
var searchBtn =document.querySelector(".searchbtn");
var ForecastContainer=document.querySelector(".forecastContainer")

//create an event listener
searchBtn.addEventListener("click", function(event){
    event.preventDefault();
    console.log(searchField.value);
    getCordinates(searchField.value)
})
var apiKey = "5056fb3f5552cba986f4ea65f8eec72e"

function getCordinates (city){
    var baseUrl = "http://api.openweathermap.org/geo/1.0/direct?q="
    var restUrl = "&limit=1&appid=5056fb3f5552cba986f4ea65f8eec72e"
    //Make a request to the url 
    fetch(baseUrl + city + restUrl)
    .then(function(response){
        //request was successful
        response.json()
        .then(function(data){
            console.log(data);
            //displayCordinates(data)
            getCurrent(data[0].lat,data[0].lon)
            displayCityName(data[0].name,data[0].state)
            getForecast(data[0].lat,data[0].lon)
        })
    })
}
//create a span element to hold searched city names
//var titleEl = document.createElement("span");

//titleEl.textContent = (cityName);

//https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
function getCurrent(lat,lon){
    var baseUrl="https://api.openweathermap.org/data/2.5/onecall?"
    var getLatLon="lat=" + lat+ "&lon=" + lon
    var restUrl="&units=imperial&exclude=minutely,hourly,daily,alerts&appid="
    fetch(baseUrl+getLatLon+restUrl+apiKey)
    .then(function(response){
        //request was successful
        response.json()
        .then(function(data){
            console.log(data);
            //displayCordinates(data)
            displayCurrent(data)
        })
    })
}      

function getForecast(lat,lon){
    var baseUrl="https://api.openweathermap.org/data/2.5/onecall?"
    var getLatLon="lat=" + lat+ "&lon=" + lon
    var restUrl="&units=imperial&exclude=minutely,hourly,current,alerts&appid="
    fetch(baseUrl+getLatLon+restUrl+apiKey)
    .then(function(response){
        //request was successful
        response.json()
        .then(function(data){
            console.log(data);
            //displayCordinates(data)
        })
    })

            //for loop for five day forecast
            function getForecast (lat,lon){
                var numbers = [0,1,2,3,4,5];
                for(var i=0;i<numbers.length; i++){
                    
            console.log(numbers[i]);
                   
                   
                }
            }
            


        }
  
function displayCurrent (data){
    var currentTemp=document.querySelector(".current-temp")
    currentTemp.textContent="Temperature: " +data.current.temp+"°F"
    var currentHumid=document.querySelector(".current-humidity")
    currentHumid.textContent="Humidity: " +data.current.humidity+"%"
    var currentWind=document.querySelector(".current-windspeed")
    currentWind.textContent="Windspeed: "+data.current.wind_speed+" MPH"
    var currentUvi=document.querySelector(".current-uvi")
    currentUvi.textContent="Uvi: "+data.current.uvi
}

    
    
function displayCityName(city,state){
    var cityNameEl=document.querySelector(".cityname")
    cityNameEl.textContent=city+", "+state
}

function displayDate(){
    var date=moment().format('MMMM Do YYYY')
    console.log(date)
    var dateEl=document.querySelector(".date")
    dateEl.textContent=date 

}
displayDate()





// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}