// grab references to the important DOM elements
const cityInput = $("#city");
const searchBtn = $("button");
const searchResults = $("#search-results");

// retrieve cities from localStorage
let searchHistory = JSON.parse(localStorage.getItem("cities"));

const apiKey = "3c52839213dc657264686d60db3357ec";

// removes search results from screen
function removeSearchResults() {
    // validation to make sure that the previous element is h6 before we try removing it
    if (searchResults.prev()[0].tagName === "H6") {
        searchResults.prev().remove();
    }

    searchResults
        .removeClass("border-bottom border-2")
        .children().remove();
}

function selectCity(event) {
    // retrieve coordinates from data attribute of clicked city
    let lat = event.target.dataset.lat
    let lon = event.target.dataset.lon

    // create object of coordinates
    const coordinates = {
        lat: lat,
        lon: lon
    }

    // // if no cities (coordinates) were retrieved from localStorage, assign coordinates to a new empty array to push to later
    if (!searchHistory) {
        searchHistory = [];
    }

    // add coordinates to searchHistory array
    searchHistory.push(coordinates);

    // create key:value pair of search history array in localStorage
    localStorage.setItem('cities', JSON.stringify(searchHistory));

    // remove search results
    removeSearchResults();
}

function searchCity() {
    // use geocoding api to get coordinates by location name
    // src: https://openweathermap.org/api/geocoding-api#direct_name
    const requestURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput.val()}&limit=5&appid=${apiKey}`
    
    
    fetch(requestURL)
        .then(function (response) {
            return response.json()
        })
        .then(function (data) {
            removeSearchResults();

            // show error message if response returns empty array
            if (data.length === 0) {
                $("<h6>No results found. Please try again.</h6>")
                    .insertAfter("form")
                    .addClass("fw-bold mt-4")
            // otherwise show search results header
            } else {
                $("<h6>Search results (please select one):</h6>")
                    .insertAfter("form")
                    .addClass("fw-bold mt-4")
            }

            // create border underneath search results for styling
            searchResults.addClass("border-bottom border-2")

            // loops through data and creates a list group item of results to append and show on screen
            for (let i=0; i < data.length; i++) {
                const result = $("<li>")
                    .addClass('list-group-item list-group-item-action')
                    .html(`${data[i].name}, ${data[i].state}, ${data[i].country}`)
                    .attr("data-lat", data[i].lat)
                    .attr("data-lon", data[i].lon);
                $("#search-results").append(result);
            }

            // clear form input
            cityInput.val("");

            $(".list-group").on("click", ".list-group-item", selectCity);

        })
}

$(document).ready(function () {
    searchBtn.on("click", searchCity);
})
// const requestURl = `https://api.openweathermap.org/data/2.5/forecast?lat=4${lat}&lon=${lon}&appid=${apiKey}`;