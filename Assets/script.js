// Declare variables
var apiKey = "3092dc2b0c499c914f724006803936b1";
var today = moment().format("ddd L")
var searchBtn = $('#search-button');
var cityListEl = $('#city-list');
var cityInputEl = $('#city-input')
var fiveDayForecastEl = $('#five-day-forecast');
var currentWeatherEl = $('#current-weather');
var cityNameEl = $('.city-name')
var tempEl = $('#temperature');
var humidEl = $('#humidity');
var windSpeedEl = $('#wind-speed');
var uvIndexEl = $('#uv-index');
var forecastEl = $('.forecast')

//Create array of searched cities
var cityHistory = []

//Create function that fetches weather
function fetchWeather(cityName) {

    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" 
    // All URL concatenations will be split into separate lines for easier reading
    + cityName 
    + "&units=imperial&appid=" 
    + apiKey;

    fetch(queryUrl)
        .then (function (response) {
            return response.json();
        })
        .then (function (data) {
            console.log("data", data);
            // Display weather content
            currentWeatherEl.removeClass("d-none");
            currentWeatherEl.addClass("d-inline");
            // Set current weather icon variables
            var iconImg = data.weather[0].icon;
            var iconUrl = 'https://openweathermap.org/img/wn/'+ iconImg + '@2x.png';
            // Show the user the searched city, the current date, an icon reflecting the current weather in that city, the current temperature, the current humidity, and the current wind speed
            cityNameEl.text(data.name + " " + "(" + today + ")");
            $('#current-pic').attr('src', iconUrl);
            $('#current-pic').attr('alt', data.weather[0].description);
            tempEl.text("Temperature:" + " " + data.main.temp + "°F");
            windSpeedEl.text("Wind Speed:" + " " + data.wind.speed + "MPH");
            humidEl.text("Humidity:" + " " + data.main.humidity + "%");

            // Obtain UV index

            var lat = data.coord.lat;
            var lon = data.coord.lon;
            var uvQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="
            + lat 
            + "&lon=" 
            + lon 
            +"&exclude=hourly,daily&appid=" 
            + apiKey;
            fetch(uvQueryUrl)
                .then(function (response) {
                    return response.json();
                })
                .then (function (data) {
                    console.log("data", data);
                    var uvIndex = $('<span>');

                    // If UV index is green, color is green; ok is yellow; bad is red
                    if (data.current.uvi < 3) {
                        uvIndex.attr('class', 'badge badge-success')
                    } else if (data.current.uvi >=3 && data.current.uvi < 8) {
                        uvIndex.attr('class', 'badge badge-warning')
                    } else {
                        uvIndex.attr('class', 'badge badge-danger')
                    }
                    uvIndex.text(data.current.uvi);
                    uvIndexEl.text("UV Index:" + " ");
                    uvIndexEl.append(uvIndex);
                })
            // Obtain five day forecast
            var fiveDayQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" 
            + lat 
            + "&lon=" 
            + lon 
            + "&units=imperial&exclude=current,minutely,hourly,alerts&appid=" 
            + apiKey;
            fetch(fiveDayQueryUrl)
                .then(function (response) {
                    return response.json();
                })
                .then (function (data) {
                    console.log("data", data);
                    $('#five-day-forecast-header').removeClass("d-none");
                    $('#five-day-forecast-header').addClass("d-inline");

                    for (var i = 1; i <= 5; i++) {

                        var date = data.daily[i].dt;
                        var forecastDate = moment.unix(date).format("MM/DD/YYYY");

                        var temp = data.daily[i].temp.day;
                        var iconImg = data.daily[i].weather[0].icon;
                        var iconUrl = 'https://openweathermap.org/img/wn/'+ iconImg + '@2x.png';
                        var wind = data.daily[i].wind_speed;
                        var humidity = data.daily[i].humidity
                        
                         // Create and stylize cards
                        var card = $('<div>');
                        card.attr('class', 'card');
                        card.addClass('col-md-2');
                        card.addClass('bg-primary');
                        card.addClass('text-white'), 
                        card.addClass('m-2');
                        card.addClass('rounded');
                
                        // create card body and append
                        var cardBody = $('<div>');
                        cardBody.attr('class', 'card-body');
                        cardBody.text(forecastDate);
                        var cardBodyIcon = $('<img>');
                        cardBodyIcon.attr('src', iconUrl);
                        cardBodyIcon.attr('alt', data.daily[i].weather[0].description);
                        var cardBodyTemp = $('<p>')
                        cardBodyTemp.text(temp + "°F");
                        var cardBodyWind = $('<p>');
                        cardBodyWind.text(wind + "MPH")
                        var cardBodyHumid = $('<p>');
                        cardBodyHumid.text(humidity + "%");

                        cardBody.append(cardBodyIcon);
                        cardBody.append(cardBodyTemp);
                        cardBody.append(cardBodyWind);
                        cardBody.append(cardBodyHumid);
                        card.append(cardBody);
                        fiveDayForecastEl.append(card);
                }
             })
        })
    };

// Create a function to clear weather cards of city data when a new city is searched
function clearWeatherCard () {
    fiveDayForecastEl.text("");
}

//Create an event listener to display weather data when search button is clicked
searchBtn.on("click", function(event) {
    // Prevent page from refreshing when a city is being searched
    event.preventDefault();
    clearWeatherCard();
    var searchedCity = cityInputEl.val();
        fetchWeather(searchedCity);
        cityHistory.push(searchedCity);
        var lastViewedCity = $('<li class="list-group-item ml-n5">' + searchedCity + '</li>');
        cityListEl.append(lastViewedCity);
        cityInputEl.val("");
        localStorage.setItem("search", JSON.stringify(cityHistory));
        // Return an error message if the search button is pressed when nothing is typed in the search field
        if (!searchedCity) {
            cityNameEl.text("Please type the name of a city in the search field.");
            currentWeatherEl.removeClass("d-inline");
            currentWeatherEl.addClass("d-none");
            $('#five-day-forecast-header').removeClass("d-inline");
            $('#five-day-forecast-header').addClass("d-none");
            return;
        }
    });
// Retrieve the data of a previously searched city when it is clicked
$(document).on("click", ".list-group-item", function() {
        clearWeatherCard();
        var listCity = $(this).text();
        fetchWeather(listCity);
});