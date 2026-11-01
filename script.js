var map = L.map("map").setView([40.73061, -73.935242], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
   maxZoom: 150,
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

   L.marker([lat, long]).addTo(map);
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

      const connectedStations = connectAPIs(stations, elevator);
      // console.log(connectedStations);
      displayMarker(connectedStations);
   } catch (error) {
      console.error(error);
      handleError();
   }
}

loadStation();
