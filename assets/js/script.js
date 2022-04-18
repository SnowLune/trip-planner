postalCode="55403"
startDate="20220414"
endDate="20220514"
dateRange= "from" + startDate + "-to-" + endDate


/* Dates need to look like this */
/* daterange=from20220419-to-20220512 */

if(startDate==""||endDate==""){
    var url="https://app.ticketmaster.com/discovery/v2/events.json?postalCode="+postalCode+"&size=100&apikey=8UdWWSAEfJjf1RGj4bqCNcwoMkxqFtFR"    
}
else{
    var url="https://app.ticketmaster.com/discovery/v2/events.json?postalCode="+postalCode+"&daterange="+dateRange+"&"+"size=100&apikey=8UdWWSAEfJjf1RGj4bqCNcwoMkxqFtFR"
}
console.log(url)
fetch(url)
.then(function(response) {
  // request was successful
  if (response.ok) {
    response.json().then(function(data) {
        console.log(data);
        displayEvents(data, postalCode);
    });
  } else {
    alert('Error: GitHub User Not Found');
  }
})
.catch(function(error) {
  // Notice this `.catch()` getting chained onto the end of the `.then()` method
  alert("Unable to connect to GitHub");
});


var displayEvents= function(data,postal){
    if (data.length === 0) {
        return;
    }
    // loop over repos
    console.log("working...");
    for (var i = 0; i < data._embedded.events.length; i++) {
        // format repo name
        var eventID= data._embedded.events[i].id;
        var eventURL = "https://app.ticketmaster.com/discovery/v2/venues/"+eventID
        var eventName = data._embedded.events[i].name;
        var eventDateTime = data._embedded.events[i].dates.start.dateTime;
        console.log(eventName, eventDateTime);
}}