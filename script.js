var map = L.map("map").setView([40.735114, -73.994336], 13);
map.setMaxZoom(20);

var elevatorIcon = L.icon({
   iconUrl: "./images/Elevator.png",
   iconSize: [80, 80],
});

var stairsIcon = L.icon({
   iconUrl: "./images/Stairs.png",
   iconSize: [80, 80],
});

const markerLayer = L.layerGroup().addTo(map);
let allStations = [];

function getTotalOutages(station) {
   return station.elevatorData.reduce(
      (total, record) => total + Number(record.total_outages || 0),
      0,
   );
}

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
   minZoom: 13,
   maxZoom: 70,
   attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

function createMarker(station) {
   const lat = Number(station.gtfs_latitude);
   const long = Number(station.gtfs_longitude);

   if (!lat || !long) {
      console.warn("Invalid coordinates:", station);
      return;
   }

   // Create the marker based on if station is accessible
   const hasElevator = station.elevatorData.length > 0;
   const icon = hasElevator ? elevatorIcon : stairsIcon;
   const marker = L.marker([lat, long], { icon });
   markerLayer.addLayer(marker);

   // Create popup content
   const popupContent = document.createElement("div");
   popupContent.classList.add("station-popup");

   // Create elevator doors
   const elevatorDoors = document.createElement("div");
   elevatorDoors.classList.add("elevator-doors");

   // Left door
   const leftDoor = document.createElement("div");
   leftDoor.classList.add("left-door");

   // Right door
   const rightDoor = document.createElement("div");
   rightDoor.classList.add("right-door");

   // Add doors to elevator
   elevatorDoors.appendChild(leftDoor);
   elevatorDoors.appendChild(rightDoor);

   // Create information container
   const stationInfo = document.createElement("div");
   stationInfo.classList.add("station-info");

   // Add elevator doors to popup
   popupContent.appendChild(elevatorDoors);

   // Station name
   const stationName = document.createElement("h3");
   stationName.classList.add("station-name");
   stationName.textContent = station.stop_name;
   stationInfo.appendChild(stationName);

   // Check if the station has elevator records
   if (station.elevatorData.length > 0) {
      const elevatorInfoDiv = document.createElement("div");
      elevatorInfoDiv.classList.add("elevator-info-div");

      const elevatorTitle = document.createElement("p");
      elevatorTitle.classList.add("elevator-title");
      elevatorTitle.textContent = "Elevator Information";
      elevatorInfoDiv.appendChild(elevatorTitle);

      const totalOutages = getTotalOutages(station);
      const stationOutages = document.createElement("p");
      stationOutages.classList.add("total-outages");
      stationOutages.innerHTML =
         "<strong>Total Outages in 2025:</strong> " + String(totalOutages);
      elevatorInfoDiv.appendChild(stationOutages);

      stationInfo.appendChild(elevatorInfoDiv);

      const elevatorsByMonth = new Map();
      // Display each month
      for (const elevator of station.elevatorData) {
         const monthKey = elevator.month.slice(0, 7); // ex 2025-01

         if (!elevatorsByMonth.has(monthKey)) {
            elevatorsByMonth.set(monthKey, []);
         }
         elevatorsByMonth.get(monthKey).push(elevator);
      }

      for (const [monthKey, elevators] of elevatorsByMonth) {
         const elevatorInfo = document.createElement("div");
         elevatorInfo.classList.add("elevator-info");

         const monthDate = new Date(`${monthKey}-01T12:00:00`);
         const monthName = monthDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
         });
         const monthTitle = document.createElement("h4");
         monthTitle.textContent = monthName;
         elevatorInfo.appendChild(monthTitle);

         for (const elevator of elevators) {
            // Equipment Code
            const equipmentCode = document.createElement("p");
            equipmentCode.innerHTML =
               "<strong>Equipment Code: </strong>" + elevator.equipment_code;
            elevatorInfo.appendChild(equipmentCode);

            // AM availability
            const amAvailability = document.createElement("p");
            amAvailability.innerHTML = elevator.am_peak_availability
               ? (amAvailability.innerHTML =
                  "<strong>AM Availability:</strong> " +
                  Math.round(elevator.am_peak_availability * 100) +
                  "%")
               : (amAvailability.innerHTML =
                  "<strong>AM Availability:</strong> No data found");
            elevatorInfo.appendChild(amAvailability);

            // PM availability
            const pmAvailability = document.createElement("p");
            pmAvailability.innerHTML = elevator.pm_peak_availability
               ? "<strong>PM Availability:</strong> " +
               Math.round(elevator.pm_peak_availability * 100) +
               "%"
               : "<strong>PM Availability:</strong> No data found";

            elevatorInfo.appendChild(pmAvailability);

            // Total outages
            const totalOutages = document.createElement("p");
            totalOutages.innerHTML =
               "<strong>Monthly Outages:</strong> " + elevator.total_outages;
            elevatorInfo.appendChild(totalOutages);

            const elevatorDivider = document.createElement("div");
            elevatorDivider.classList.add("elevator-divider");
            elevatorInfo.appendChild(elevatorDivider);
         }
         stationInfo.appendChild(elevatorInfo);
      }
   } else {
      const noData = document.createElement("p");
      noData.classList.add("no-data");
      noData.textContent = "No matching elevator records found.";
      stationInfo.appendChild(noData);
   }

   // Add station information to popup
   popupContent.appendChild(stationInfo);

   // Attach popup to marker
   marker.bindPopup(popupContent);

   // Start animation when popup opens
   marker.on("popupopen", function () {
      // Reset doors to closed position
      elevatorDoors.classList.remove("open");

      // Wait a moment before opening the doors
      setTimeout(function () {
         elevatorDoors.classList.add("open");
      }, 300);
   });

   // Reset animation when popup closes
   marker.on("popupclose", function () {
      elevatorDoors.classList.remove("open");
   });
}

function handleError() {
   // check if error modal already exist
   const existingModal = document.getElementById("error-modal");
   if (existingModal) existingModal.remove();

   // reminder to style in css file, fixed position
   const errorModal = document.createElement("div");
   errorModal.id = "error-modal";
   document.body.appendChild(errorModal);

   errorModal.textContent = "Something went wrong, please try again later.";
   document.body.appendChild(errorModal);
}

// manhattan stations API
async function getstationData() {
   const response = await fetch(
      "https://data.ny.gov/resource/39hk-dx4f.json?$query=SELECT%0A%20%20%60complex_id%60%2C%0A%20%20%60division%60%2C%0A%20%20%60line%60%2C%0A%20%20%60stop_name%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60cbd%60%2C%0A%20%20%60daytime_routes%60%2C%0A%20%20%60structure%60%2C%0A%20%20%60gtfs_latitude%60%2C%0A%20%20%60gtfs_longitude%60%2C%0A%20%20%60north_direction_label%60%2C%0A%20%20%60south_direction_label%60%2C%0A%20%20%60ada%60%2C%0A%20%20%60ada_northbound%60%2C%0A%20%20%60ada_southbound%60%2C%0A%20%20%60ada_notes%60%2C%0A%20%20%60georeference%60%0AWHERE%20caseless_eq(%60borough%60%2C%20%22M%22)%0AORDER%20BY%20%60station_id%60%20ASC%20NULL%20LAST",
   );
   if (!response.ok) {
      throw new Error(`Station API request failed: ${response.status}`);
   }
   return response.json();
}

// elevator API
async function getelevatorData() {
   const response = await fetch(
      "https://data.ny.gov/resource/rc78-7x78.json?$query=SELECT%0A%20%20%60month%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60equipment_type%60%2C%0A%20%20%60total_outages%60%2C%0A%20%20%60pm_peak_availability%60%2C%0A%20%20%60station_name%60%2C%0A%20%20%60station_complex_name%60%2C%0A%20%20%60station_complex_mrn%60%2C%0A%20%20%60am_peak_availability%60%2C%0A%20%20%60equipment_code%60%0AWHERE%0A%20%20caseless_one_of(%60borough%60%2C%20%22Manhattan%22)%0A%20%20AND%20%60month%60%0A%20%20%20%20%20%20%20%20BETWEEN%20%222025-01-01T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20%20%20%20%20AND%20%222025-12-31T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20AND%20caseless_one_of(%60equipment_type%60%2C%20%22Elevator%22)%0AORDER%20BY%20%60month%60%20ASC%20NULL%20LAST%0ALIMIT%2050000",
   );
   if (!response.ok) {
      throw new Error(`Elevator API request failed: ${response.status}`);
   }
   return response.json();
}

function connectAPIs(stations, elevator) {
   // hashmap to store elevator info and its station
   const elevatorInfo = new Map();

   for (const info of elevator) {
      const complexID = String(info.station_complex_mrn ?? "").trim();
      if (!complexID) continue;

      // no match (no elevators) = empty array
      if (!elevatorInfo.has(complexID)) {
         elevatorInfo.set(complexID, []);
      }
      elevatorInfo.get(complexID).push(info);
   }

   return stations.map((station) => ({
      ...station,
      elevatorData: elevatorInfo.get(String(station.complex_id ?? "").trim()) || [],
   }));
}

function displayMarker(stations) {
   markerLayer.clearLayers();
   for (const station of stations) {
      createMarker(station);
   }
}

async function loadStation() {
   try {
      // get data from both APIs and use connectAPIs for hashing
      const [stations, elevator] = await Promise.all([
         getstationData(),
         getelevatorData(),
      ]);

      allStations = connectAPIs(stations, elevator);
      displayMarker(allStations);
   } catch (error) {
      console.error(error);
      handleError();
   }
}

function filterDropdown() {
   const toggleIcon = document.getElementById("toggle-dropdown");
   const dropdownContent = document.getElementById("dropdown-content");
   const filterContainer = document.querySelector(".filter-container");

   toggleIcon.addEventListener("click", () => {
      const isOpen = dropdownContent.classList.toggle("show");
      toggleIcon.setAttribute("aria-expanded", String(isOpen));
   });

   document.addEventListener("click", (e) => {
      if (!filterContainer.contains(e.target)) {
         dropdownContent.classList.remove("show");
         toggleIcon.setAttribute("aria-expanded", "false");
      }
   });
}

function rankingDropdown() {
   const toggleRanking = document.getElementById("toggle-ranking");
   const rankingContent = document.getElementById("ranking-content");
   const filterContainer = document.querySelector(".filter-container");
   const rankingList = document.getElementById("ranking-list");

   toggleRanking.addEventListener("click", () => {
      const isOpen = rankingContent.classList.toggle("show");
      toggleRanking.setAttribute("aria-expanded", String(isOpen));

      // sort stations from most outages to fewest
      // slicing takes the top 10 highest
      const highestOutages = allStations
         .filter((station) => station.elevatorData.length > 0)
         .map((station) => ({
            name: station.stop_name,
            totalOutages: getTotalOutages(station),
         }))
         .sort((a, b) => b.totalOutages - a.totalOutages)
         .slice(0, 10);

      // console.table(highestOutages);

      // clear previous ranking to prevent duplicates
      rankingList.innerHTML = "";

      const rankedList = document.createElement("ol");
      const rankedStationInfo = document.createElement("div");
      rankedStationInfo.classList.add("ranked-station-info");
      // load info of top 10 stations
      for (const topStation of highestOutages) {
         const stationName = document.createElement("li");

         stationName.innerHTML = "Station: <strong>" + topStation.name + "</strong>";
         rankedStationInfo.appendChild(stationName);

         const outageAmount = document.createElement("p");
         outageAmount.classList.add("outage-ranking-info");
         outageAmount.innerHTML =
            "Total Outages: <strong>" + topStation.totalOutages + "</strong>";

         rankedStationInfo.appendChild(outageAmount);
      }
      rankedList.appendChild(rankedStationInfo);
      rankingList.appendChild(rankedList);
   });

   document.addEventListener("click", (e) => {
      if (!filterContainer.contains(e.target)) {
         rankingContent.classList.remove("show");
         toggleRanking.setAttribute("aria-expanded", "false");
      }
   });
}

// slider mechanics felt too clunky
// show slider value
// const outagesSlider = document.getElementById("outages");
// const outagesValue = document.getElementById("outages-value");
// outagesSlider.addEventListener("input", () => {
//    outagesValue.value = outagesSlider.value;
// });

const filterForm = document.getElementById("filter-form");

// handle form submission
filterForm.addEventListener("submit", (e) => {
   e.preventDefault();

   const selectedElevator = new FormData(e.currentTarget).get("accessible");
   // const useOutageLimit = document.getElementById("use-outages-filter").checked;
   // const selectedOutage = Number(document.getElementById("outages").value);

   const filteredStations = allStations.filter((station) => {
      const hasElevator = station.elevatorData.length > 0;
      const matchesElevator =
         !selectedElevator || hasElevator === (selectedElevator === "1");

      // const totalOutages = getTotalOutages(station);

      // const matchesOutages =
      //    !useOutageLimit ||
      //    (station.elevatorData.length > 0 && totalOutages === selectedOutage);
      // return matchesElevator && matchesOutages;
      return matchesElevator;
   });
   displayMarker(filteredStations);
});

filterForm.addEventListener("reset", () => {
   displayMarker(allStations);
   // setTimeout(() => {
   //    outagesValue.value = outagesSlider.value;
   // }, 0);
});
filterDropdown();
rankingDropdown();
loadStation();
