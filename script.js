var map = L.map("map").setView([40.73061, -73.935242], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
   maxZoom: 150,
   attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// elevator API
async function getData() {
   try {
      const response = await fetch(
         "https://data.ny.gov/resource/rc78-7x78.json?$query=SELECT%0A%20%20%60month%60%2C%0A%20%20%60borough%60%2C%0A%20%20%60equipment_type%60%2C%0A%20%20%60total_outages%60%2C%0A%20%20%60pm_peak_availability%60%2C%0A%20%20%60station_name%60%2C%0A%20%20%60station_complex_name%60%2C%0A%20%20%60station_complex_mrn%60%2C%0A%20%20%60am_peak_availability%60%0AWHERE%0A%20%20caseless_one_of(%60borough%60%2C%20%22Manhattan%22)%0A%20%20AND%20%60month%60%0A%20%20%20%20%20%20%20%20BETWEEN%20%222025-01-01T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20%20%20%20%20%20%20AND%20%222025-12-31T13%3A48%3A41%22%20%3A%3A%20floating_timestamp%0A%20%20AND%20caseless_one_of(%60equipment_type%60%2C%20%22Elevator%22)%0AORDER%20BY%20%60month%60%20ASC%20NULL%20LAST",
      );
      const data = await response.json();
      console.log(data);
   } catch (error) {
      console.log(error);

      // check if error modal already exist
      const existingModal = document.getElementById("error-modal");
      if (existingModal) existingModal.remove();

      // reminder to style in css file, fixed position
      const errModal = document.createElement("div");
      errModal.id = "error-modal";
      document.body.appendChild(errModal);

      errModal.textContent = "Something went wrong, please try again later.";
      document.body.appendChild(errModal);
   }
}

getData();
