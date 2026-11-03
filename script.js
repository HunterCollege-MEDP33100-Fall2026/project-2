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
      const elevatorTitle = document.createElement("p");
      elevatorTitle.classList.add("elevator-title");
      elevatorTitle.textContent = "Elevator Information";
      stationInfo.appendChild(elevatorTitle);

      // Display each elevator record
      for (const elevator of station.elevatorData) {
         const elevatorInfo = document.createElement("div");
         elevatorInfo.classList.add("elevator-info");

         elevatorInfo.innerHTML =
            "<p>Month: " +
            elevator.month +
            "</p>" +
            "<p>AM Availability: " +
            elevator.am_peak_availability +
            "</p>" +
            "<p>PM Availability: " +
            elevator.pm_peak_availability +
            "</p>" +
            "<p>Total Outages: " +
            elevator.total_outages +
            "</p>";

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
      "https://data.ny.gov/resource/rc78-7x78.json?$query=SELECT%0A%20%20%60month%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60equipment_type%60%2C%0A%20%20%60total_outages%60%2C%0A%20%20%60pm_peak_availability%60%2C%0A%20%20%60station_name%60%2C%0A%20%20%60station_complex_name%60%2C%0A%20%20%60station_complex_mrn%60%2C%0A%20%20%60am_peak_availability%60%0AWHERE%0A%20%20caseless_one_of(%60borough%60%2C%20%22Manhattan%22)%0A%20%20AND%20%60month%60%0A%20%20%20%20%20%20%20%20BETWEEN%20%222025-01-01T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20%20%20%20%20AND%20%222025-12-31T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20AND%20caseless_one_of(%60equipment_type%60%2C%20%22Elevator%22)%0AORDER%20BY%20%60month%60%20ASC%20NULL%20LAST",
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
   const toggleIcon = document.getElementById("toggle-icon");
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

// show slider value
const outagesSlider = document.getElementById("outages");
const outagesValue = document.getElementById("outages-value");
outagesSlider.addEventListener("input", () => {
   outagesValue.value = outagesSlider.value;
});

const filterForm = document.getElementById("filter-form");

// handle form submission
filterForm.addEventListener("submit", (e) => {
   e.preventDefault();

   const selectedElevator = new FormData(e.currentTarget).get("accessible");
   const useOutageLimit = document.getElementById("use-outages-filter").checked;
   const maxOutages = Number(document.getElementById("outages").value);

   const filteredStations = allStations.filter((station) => {
      const hasElevator = station.elevatorData.length > 0;
      const matchesElevator =
         !selectedElevator || hasElevator === (selectedElevator === "1");

      // adding up total outages for a station
      const totalOutages = station.elevatorData.reduce(
         (total, record) => total + Number(record.total_outages || 0),
         0,
      );
      const matchesOutages =
         !useOutageLimit ||
         (station.elevatorData.length > 0 && totalOutages <= maxOutages);
      return matchesElevator && matchesOutages;
   });
   filterForm.reset();
   outagesValue.value = outagesSlider.value;
   displayMarker(filteredStations);
});

filterForm.addEventListener("reset", () => {
   displayMarker(allStations);
   document.getElementById("outages-value").value =
      document.getElementById("outages").value;
});
filterDropdown();
loadStation();
