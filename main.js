// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9VgKoEhZ-zlsIvcYoW-oLEavnOR1TZx8",
  authDomain: "earthworks-a274e.firebaseapp.com",
  projectId: "earthworks-a274e",
  storageBucket: "earthworks-a274e.appspot.com",
  messagingSenderId: "648032953527",
  appId: "1:648032953527:web:23d93a2cc88fca21c09932",
  measurementId: "G-0HE6MVHMFD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

//Load a map to leaflet
var map = L.map("map").setView([-25.753352, 28.236919], 14);
map.setMaxBounds(map.getBounds());

//Baselayer
var tiles = L.tileLayer(
  "https://api.mapbox.com/styles/v1/marinetblom/cl9bohhha000w15r1zmza912y/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFyaW5ldGJsb20iLCJhIjoiY2w3NjJmMHdlMGZscjNudDhjNHFraDB2dyJ9.unx4-Uni0RveKtgu2YH_qA",
  {
    minZoom: 15,
    maxZoom: 20,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
).addTo(map);

var BaseMap_2 = L.tileLayer(
  "https://api.mapbox.com/styles/v1/marinetblom/cl9hbp0m2004u16jp7hu60fju/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFyaW5ldGJsb20iLCJhIjoiY2w3NjJmMHdlMGZscjNudDhjNHFraDB2dyJ9.unx4-Uni0RveKtgu2YH_qA",
  {
    minZoom: 1,
    maxZoom: 20,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }
);

var Satellite = L.tileLayer(
  "https://api.mapbox.com/styles/v1/marinetblom/cl9lfhkyb001y14pe4u9ccn34/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFyaW5ldGJsb20iLCJhIjoiY2w3NjJmMHdlMGZscjNudDhjNHFraDB2dyJ9.unx4-Uni0RveKtgu2YH_qA",
  {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    minZoom: 0,
    maxZoom: 20,
  }
);

var Night = L.tileLayer(
  "https://api.mapbox.com/styles/v1/marinetblom/cl9lfo1qd00ga15l38eb38lpn/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFyaW5ldGJsb20iLCJhIjoiY2w3NjJmMHdlMGZscjNudDhjNHFraDB2dyJ9.unx4-Uni0RveKtgu2YH_qA",
  {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    minZoom: 0,
    maxZoom: 20,
  }
);

//customize icon style
var brown = L.icon({
  iconUrl: "brown.png",
  iconSize: [27, 31],
  iconAnchor: [16, 37],
  popupAnchor: [0, -30],
});

var green = L.icon({
  iconUrl: "green.png",
  iconSize: [27, 31],
  iconAnchor: [16, 37],
  popupAnchor: [0, -30],
});

// Styling icons with a function
function myIcon(distance) {
  if (distance == 1) {
    return brown;
  } else {
    return green;
  }
}
//add map scale
// L.control
//   .scale({ metric: true, imperial: false, position: "bottomright" })
//   .addTo(map);

//Load points to map
var NSFASYes = [];
var NSFASNo = [];
var All = [];

document.addEventListener("DOMContentLoaded", () => {
  const residencesRef = ref(db, "features/");
  onValue(residencesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      data.forEach((res) => {
        function marker() {
          var marker = null;
          marker = new L.Marker(
            new L.latLng([res.coordinates[1], res.coordinates[0]]),
            { ...res }
          );

          marker.setIcon(myIcon(res.Distance_to_Main));
          const popupContent = `
                  <b>Name:</b> ${res.Name} <br>
                  <b>Average Annual Price:</b> R${res.Avg_Price}`;
          marker.bindPopup(popupContent);
          return marker;
        }

        if (res.NSFAS_Acc == "Yes") {
          NSFASYes.push(marker());
        } else if (res.NSFAS_Acc == "No") {
          NSFASNo.push(marker());
        }
      });

      // Create layer groups to split data
      let NSFASYesLayer = L.layerGroup(NSFASYes);
      let NSFASNoLayer = L.layerGroup(NSFASNo);
      All = NSFASYes.concat(NSFASNo);
      var AllLayer = L.layerGroup(All).addTo(map);

      //layer control
      var baseMaps = {
        Default: tiles,
        "Show More": BaseMap_2,
        Terrain: Satellite,
        Dark: Night,
      };

      var layerControl = L.control.layers(baseMaps).addTo(map);

      //Search Function
      var controlSearch = new L.Control.Search({
        position: "bottomright",
        layer: AllLayer,
        initial: false,
        propertyName: "Name", //property in marker.options(or feature.properties for vector layer) trough filter elements in layer,
        zoom: 12,
        marker: false,
        moveToLocation: function (latlng, name, map) {
          map.flyTo(latlng, 19);
          // e.layer.getPopup().setContent("test");
          // e.layer.openPopup();
        },
      });
      controlSearch.addTo(map);

      // Filter with BUTTONS
      $("#btn-yes").click(function () {
        map.addLayer(NSFASYesLayer);
        map.removeLayer(NSFASNoLayer);
      });
      $("#btn-no").click(function () {
        map.addLayer(NSFASNoLayer);
        map.removeLayer(NSFASYesLayer);
      });
      $("#btn-all").click(function () {
        map.addLayer(NSFASYesLayer);
        map.addLayer(NSFASNoLayer);
      });
    }
  });
});
/*Legend */
var legend = L.control({ position: "bottomleft" });
legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Distance to Campus</h4>";
  div.innerHTML +=
    '<i class="icon" style="background-image: url(brown.png);background-repeat: no-repeat;"></i><span>Greater than 1 km</span><br>';
  div.innerHTML +=
    '<i class="icon" style="background-image: url(green.png);background-repeat: no-repeat;"></i><span>Less than 1 km</span><br>';
  return div;
};
legend.addTo(map);

var sidePanel = L.control({ position: "topleft" });
sidePanel.onAdd = function (map) {
  var div = L.DomUtil.create("div", "side-panel");
  var sidePanelContent = `
    <img src="Logo.png"/ style="height: 8vh; width: 12vw">
    <span class="sidepanel-text">Click buttons below to filter your data</span>
    <div id="myChart"></div>
    <div class="btn-group">
      <button type="button" id="btn-all" class="btn btn-danger">All</button>
      <button type="button" id="btn-yes" class="btn btn-danger">
        NSFAS Accredited
      </button>
      <button type="button" id="btn-no" class="btn btn-danger">
        Not NSFAS Accredited
      </button>
    </div>
  `;
  div.innerHTML = sidePanelContent;
  return div;
};
sidePanel.addTo(map);
