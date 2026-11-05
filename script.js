// MAP SETUP //

// Creates the Leaflet map and sets the starting location and zoom level
var map = L.map("map").setView([40.735114, -73.994336], 13);
map.setMaxZoom(20);

// Creates the custom icon for stations with elevators
var elevatorIcon = L.icon({
   iconUrl: "./images/Elevator.png",
   iconSize: [80, 80],
});
// Creates the custom icon for stations without elevators
var stairsIcon = L.icon({
   iconUrl: "./images/Stairs.png",
   iconSize: [80, 80],
});

// Creates a layer to hold all station markers
const markerLayer = L.layerGroup().addTo(map);
// Stores all station data from the APIs
let allStations = [];

// CALCULATE TOTAL OUTAGES //

// Adds together all elevator outages belonging to a station
function getTotalOutages(station) {
   return station.elevatorData.reduce(
      (total, record) => total + Number(record.total_outages || 0),
      0,
   );
}

// MAP BACKGROUND //

// Adds the OpenStreetMap tiles as the map background
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
   minZoom: 13,
   maxZoom: 70,
   attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// CREATE STATION MARKERS AND POPUPS //

function createMarker(station) {
   // Gets the station coordinates from the API
   const lat = Number(station.gtfs_latitude);
   const long = Number(station.gtfs_longitude);

   // Skips stations that do not have valid coordinates
   if (!lat || !long) {
      console.warn("Invalid coordinates:", station);
      return;
   }

   // Selects the marker icon based on whether the station has elevator records
   const hasElevator = station.elevatorData.length > 0;
   const icon = hasElevator ? elevatorIcon : stairsIcon;
   const marker = L.marker([lat, long], { icon });
   markerLayer.addLayer(marker);

   // Creates the main popup container
   const popupContent = document.createElement("div");
   popupContent.classList.add("station-popup");

   // Creates the elevator doors for the popup animation
   const elevatorDoors = document.createElement("div");
   elevatorDoors.classList.add("elevator-doors");

   // Creates the left elevator doors
   const leftDoor = document.createElement("div");
   leftDoor.classList.add("left-door");

   // Creates the right elevator doors
   const rightDoor = document.createElement("div");
   rightDoor.classList.add("right-door");

   // Add both doors to the elevator container
   elevatorDoors.appendChild(leftDoor);
   elevatorDoors.appendChild(rightDoor);

   // Creates the container for station and elevator information
   const stationInfo = document.createElement("div");
   stationInfo.classList.add("station-info");

   // Add elevator doors to popup
   popupContent.appendChild(elevatorDoors);

   // Displays the station name in the popup
   const stationName = document.createElement("h3");
   stationName.classList.add("station-name");
   stationName.textContent = station.stop_name;
   stationInfo.appendChild(stationName);

   // Check if the station has elevator records
   if (station.elevatorData.length > 0) {
      const elevatorInfoDiv = document.createElement("div");
      elevatorInfoDiv.classList.add("elevator-info-div");

      // Creates the elevator information heading
      const elevatorTitle = document.createElement("p");
      elevatorTitle.classList.add("elevator-title");
      elevatorTitle.textContent = "Elevator Information";
      elevatorInfoDiv.appendChild(elevatorTitle);

      // Calculates and displays the station's total outages for 2025
      const totalOutages = getTotalOutages(station);
      const stationOutages = document.createElement("p");
      stationOutages.classList.add("total-outages");
      stationOutages.innerHTML =
         "<strong>Total Outages in 2025:</strong> " + String(totalOutages);
      elevatorInfoDiv.appendChild(stationOutages);

      stationInfo.appendChild(elevatorInfoDiv);

      // Groups elevator records by month
      const elevatorsByMonth = new Map();
      // Display each month
      for (const elevator of station.elevatorData) {
         // Gets the year and month from the date
         const monthKey = elevator.month.slice(0, 7); // ex 2025-01

         // Creates a new group if the month does not exist yet
         if (!elevatorsByMonth.has(monthKey)) {
            elevatorsByMonth.set(monthKey, []);
         }

         // Adds the elevator record to its matching month
         elevatorsByMonth.get(monthKey).push(elevator);
      }

      // Loops through each month and its elevator records
      for (const [monthKey, elevators] of elevatorsByMonth) {
         const elevatorInfo = document.createElement("div");
         elevatorInfo.classList.add("elevator-info");

         // Converts the month number into its full month name and year
         const monthDate = new Date(`${monthKey}-01T12:00:00`);
         const monthName = monthDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
         });

         // Displays the month heading
         const monthTitle = document.createElement("h4");
         monthTitle.textContent = monthName;
         elevatorInfo.appendChild(monthTitle);

         // Displays information for each elevator recorded during that month
         for (const elevator of elevators) {
            // Displays the elevator equipment Code
            const equipmentCode = document.createElement("p");
            equipmentCode.innerHTML =
               "<strong>Equipment Code: </strong>" + elevator.equipment_code;
            elevatorInfo.appendChild(equipmentCode);

            // Displays the AM availability
            const amAvailability = document.createElement("p");
            amAvailability.innerHTML = elevator.am_peak_availability
               ? (amAvailability.innerHTML =
                    "<strong>AM Availability:</strong> " +
                    Math.round(elevator.am_peak_availability * 100) +
                    "%")
               : (amAvailability.innerHTML =
                    "<strong>AM Availability:</strong> No data found");
            elevatorInfo.appendChild(amAvailability);

            // Displays the PM availability
            const pmAvailability = document.createElement("p");
            pmAvailability.innerHTML = elevator.pm_peak_availability
               ? "<strong>PM Availability:</strong> " +
                 Math.round(elevator.pm_peak_availability * 100) +
                 "%"
               : "<strong>PM Availability:</strong> No data found";

            elevatorInfo.appendChild(pmAvailability);

            // Displays the total outages for the individual elevator that month
            const totalOutages = document.createElement("p");
            totalOutages.innerHTML =
               "<strong>Monthly Outages:</strong> " + elevator.total_outages;
            elevatorInfo.appendChild(totalOutages);

            // Adds a divider between elevator records
            const elevatorDivider = document.createElement("div");
            elevatorDivider.classList.add("elevator-divider");
            elevatorInfo.appendChild(elevatorDivider);
         }
         // Adds the monthly information to the station popup
         stationInfo.appendChild(elevatorInfo);
      }
   } else {
      // Displays a message when no elevator records are available
      const noData = document.createElement("p");
      noData.classList.add("no-data");
      noData.textContent = "No matching elevator records found.";
      stationInfo.appendChild(noData);
   }

   // Add station information to popup
   popupContent.appendChild(stationInfo);

   // Connects the popup content to the station marker
   marker.bindPopup(popupContent);

   // Starts the elevator door animation when the popup opens
   marker.on("popupopen", function () {
      // Reset doors to closed position
      elevatorDoors.classList.remove("open");

      // Waits 300 milliseconds before opening the doors
      setTimeout(function () {
         elevatorDoors.classList.add("open");
      }, 300);
   });

   // Reset animation when popup closes
   marker.on("popupclose", function () {
      elevatorDoors.classList.remove("open");
   });
}

// ERROR MESSAGE //

// Creates an error message if the API data cannot be loaded
function handleError() {
   // check if error modal already exist and removes it
   const existingModal = document.getElementById("error-modal");
   if (existingModal) existingModal.remove();

   // Creates the error message container
   const errorModal = document.createElement("div");
   errorModal.id = "error-modal";
   document.body.appendChild(errorModal);

   // Displays the error message
   errorModal.textContent = "Something went wrong, please try again later.";
   document.body.appendChild(errorModal);
}

// MANHATTAN STATIONS API //
async function getstationData() {
   const response = await fetch(
      "https://data.ny.gov/resource/39hk-dx4f.json?$query=SELECT%0A%20%20%60complex_id%60%2C%0A%20%20%60division%60%2C%0A%20%20%60line%60%2C%0A%20%20%60stop_name%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60cbd%60%2C%0A%20%20%60daytime_routes%60%2C%0A%20%20%60structure%60%2C%0A%20%20%60gtfs_latitude%60%2C%0A%20%20%60gtfs_longitude%60%2C%0A%20%20%60north_direction_label%60%2C%0A%20%20%60south_direction_label%60%2C%0A%20%20%60ada%60%2C%0A%20%20%60ada_northbound%60%2C%0A%20%20%60ada_southbound%60%2C%0A%20%20%60ada_notes%60%2C%0A%20%20%60georeference%60%0AWHERE%20caseless_eq(%60borough%60%2C%20%22M%22)%0AORDER%20BY%20%60station_id%60%20ASC%20NULL%20LAST",
   );
   if (!response.ok) {
      throw new Error(`Station API request failed: ${response.status}`);
   }
   return response.json();
}

// MTA ELEVATOR API //
async function getelevatorData() {
   const response = await fetch(
      "https://data.ny.gov/resource/rc78-7x78.json?$query=SELECT%0A%20%20%60month%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60equipment_type%60%2C%0A%20%20%60total_outages%60%2C%0A%20%20%60pm_peak_availability%60%2C%0A%20%20%60station_name%60%2C%0A%20%20%60station_complex_name%60%2C%0A%20%20%60station_complex_mrn%60%2C%0A%20%20%60am_peak_availability%60%2C%0A%20%20%60equipment_code%60%0AWHERE%0A%20%20caseless_one_of(%60borough%60%2C%20%22Manhattan%22)%0A%20%20AND%20%60month%60%0A%20%20%20%20%20%20%20%20BETWEEN%20%222025-01-01T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20%20%20%20%20AND%20%222025-12-31T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20AND%20caseless_one_of(%60equipment_type%60%2C%20%22Elevator%22)%0AORDER%20BY%20%60month%60%20ASC%20NULL%20LAST%0ALIMIT%2050000",
   );
   if (!response.ok) {
      throw new Error(`Elevator API request failed: ${response.status}`);
   }
   return response.json();
}

// CONNECT THE TWO API DATASETS //
function connectAPIs(stations, elevator) {
   // hashmap to store elevator info and its station
   const elevatorInfo = new Map();

   // Goes through each elevator record
   for (const info of elevator) {
      const complexID = String(info.station_complex_mrn ?? "").trim();
      if (!complexID) continue;

      // no match (no elevators) = empty array
      if (!elevatorInfo.has(complexID)) {
         elevatorInfo.set(complexID, []);
      }
      // Adds the elevator information to its matching station ID
      elevatorInfo.get(complexID).push(info);
   }

   // Matches each station with its elevator information using the station ID
   return stations.map((station) => ({
      ...station,
      elevatorData: elevatorInfo.get(String(station.complex_id ?? "").trim()) || [],
   }));
}

// DISPLAY MAP MARKERS //

function displayMarker(stations) {
   // Removes the previous markers and displays the selected stations
   markerLayer.clearLayers();
   for (const station of stations) {
      createMarker(station);
   }
}

// LOAD API DATA AND DISPLAY THE MAP //

async function loadStation() {
   try {
      // get data from both APIs and use connectAPIs for hashing
      const [stations, elevator] = await Promise.all([
         getstationData(),
         getelevatorData(),
      ]);

      // Connects the two datasets and saves all station information
      allStations = connectAPIs(stations, elevator);
      // Displays all station markers on the map
      displayMarker(allStations);
   } catch (error) {
      console.error(error);
      handleError();
   }
}

// FILTER DROPDOWN //

// Controls the opening and closing of the filter dropdown
function filterDropdown() {
   const toggleIcon = document.getElementById("toggle-dropdown");
   const dropdownContent = document.getElementById("dropdown-content");
   const filterContainer = document.querySelector(".filter-container");

   // Opens or closes the filter when its button is clicked
   toggleIcon.addEventListener("click", () => {
      const isOpen = dropdownContent.classList.toggle("show");
      toggleIcon.setAttribute("aria-expanded", String(isOpen));
   });

   // Closes the dropdown when the user clicks outside the filter container
   document.addEventListener("click", (e) => {
      if (!filterContainer.contains(e.target)) {
         dropdownContent.classList.remove("show");
         toggleIcon.setAttribute("aria-expanded", "false");
      }
   });
}

// TOP 10 OUTAGE RANKING //

function rankingDropdown() {
   // Controls the ranking popup and displays the stations with the most outages
   const toggleRanking = document.getElementById("toggle-ranking");
   const rankingContent = document.getElementById("ranking-content");
   const filterContainer = document.querySelector(".filter-container");
   const rankingList = document.getElementById("ranking-list");

   // Opens or closes the ranking popup when the button is clicked
   toggleRanking.addEventListener("click", () => {
      const isOpen = rankingContent.classList.toggle("show");
      toggleRanking.setAttribute("aria-expanded", String(isOpen));

      // Finds stations with elevator records and calculates their total outages
      const highestOutages = allStations
         .filter((station) => station.elevatorData.length > 0)
         .map((station) => ({
            name: station.stop_name,
            totalOutages: getTotalOutages(station),
         }))
         // sort stations from most outages to fewest
         .sort((a, b) => b.totalOutages - a.totalOutages)
         // slicing takes the top 10 highest
         .slice(0, 10);

      // console.table(highestOutages);

      // Clear previous ranking to prevent duplicates
      rankingList.innerHTML = "";

      // Creates the ordered list for the top 10 stations
      const rankedList = document.createElement("ol");
      const rankedStationInfo = document.createElement("div");
      rankedStationInfo.classList.add("ranked-station-info");

      // Loops through the top 10 stations and displays their information
      for (const topStation of highestOutages) {
         const stationName = document.createElement("li");

         // Displays the station name
         stationName.innerHTML = "Station: <strong>" + topStation.name + "</strong>";
         rankedStationInfo.appendChild(stationName);

         // Displays the total number of outages
         const outageAmount = document.createElement("p");
         outageAmount.classList.add("outage-ranking-info");
         outageAmount.innerHTML =
            "Total Outages: <strong>" + topStation.totalOutages + "</strong>";

         rankedStationInfo.appendChild(outageAmount);
      }
      // Adds the station information to the ranking list
      rankedList.appendChild(rankedStationInfo);
      rankingList.appendChild(rankedList);
   });

   // Closes the ranking popup when the user clicks outside the filter container
   document.addEventListener("click", (e) => {
      if (!filterContainer.contains(e.target)) {
         rankingContent.classList.remove("show");
         toggleRanking.setAttribute("aria-expanded", "false");
      }
   });
}

// PREVIOUS OUTAGE SLIDER IDEA //

// slider mechanics felt too clunky
// show slider value
// const outagesSlider = document.getElementById("outages");
// const outagesValue = document.getElementById("outages-value");
// outagesSlider.addEventListener("input", () => {
//    outagesValue.value = outagesSlider.value;
// });

// FILTER STATIONS BY ELEVATOR AVAILABILITY //

// Selects the filter form from the HTML
const filterForm = document.getElementById("filter-form");

// handle form submission
filterForm.addEventListener("submit", (e) => {
   // Prevents the page from refreshing when the form is submitted
   e.preventDefault();

   // Gets the user's selected elevator filter
   const selectedElevator = new FormData(e.currentTarget).get("accessible");
   // const useOutageLimit = document.getElementById("use-outages-filter").checked;
   // const selectedOutage = Number(document.getElementById("outages").value);

   const filteredStations = allStations.filter((station) => {
      // Checks if the station has elevator records
      const hasElevator = station.elevatorData.length > 0;
      // Checks if the station matches the selected filter
      const matchesElevator =
         !selectedElevator || hasElevator === (selectedElevator === "1");

      // Keeps stations that match the selected elevator option
      return matchesElevator;
   });
   // Updates the map to display only the filtered stations
   displayMarker(filteredStations);
});

// Restores all station markers when the user clears the filter
filterForm.addEventListener("reset", () => {
   displayMarker(allStations);
});

// START PROJECT FUNCTIONS //

// Activates the filter dropdown
filterDropdown();
// Activates the ranking  dropdown
rankingDropdown();
// Fetches the API data and loads all station markers onto the map
loadStation();
