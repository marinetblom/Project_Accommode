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

//Load points to map
var NSFASYes = [];
var NSFASNo = [];
var All = [];

var Option1Arr = [];
var Option2Arr = [];
var Option3Arr = [];

//Side panel
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


    <span class="price_text">Select price range from dropdown list and click on "show"</span>
    <div class="budget">
    <select id="dropdown">
    <option> Choose Range </option> 
      <option value="1">R30000 - R60000</option>
      <option value="2">R60000 - R90000</option>
      <option value="3">R90000 - R110000</option>
    </select>
    </div>
    <button type="button" id="budget-btn" class="btn btn-danger">Show</button>
  `;
  div.innerHTML = sidePanelContent;
  return div;
};
sidePanel.addTo(map);

//Get  value of dropdown list
function getOption() {
  let i = document.getElementById("dropdown").value;
  return i;
}

//Load datapionts
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
                  <b>Average Annual Price:</b> R${res.Avg_Price} <br>
                  <center>Visit the website <a href = ${res.url} target = "_blank">here</a></center> <br>
                  <button type="button" id="more" class="btn btn-danger" title="Show budget distribution for this residence">Budget Distribution</button>`;
          marker.bindPopup(popupContent).on("popupopen", () => {
            $("#more").on("click", (e) => {
              e.preventDefault();
              // chart variables
              var bud = prompt("Enter your annual budget", "100000");
              var rent = res.Avg_Price;
              var rentPer = (rent / bud) * 100;
              var food = 14000;
              var foodPer = (food / bud) * 100;
              var stationary = 5200;
              var stationaryPer = (stationary / bud) * 100;
              var left = 100 - rentPer;
              //Test if budget will be sufficient
              if (rent + food + stationary > bud) {
                alert(
                  "unfortunately, your annual budget will be insufficient for this residence"
                );
              } else {
                makechart(rentPer, left, foodPer, stationaryPer);
              }
            });
          });
          return marker;
        }

        //NSFAS Filter If ststement
        if (res.NSFAS_Acc == "Yes") {
          NSFASYes.push(marker());
        } else if (res.NSFAS_Acc == "No") {
          NSFASNo.push(marker());
        }

        // Budget Filter If statement
        if (res.Avg_Price <= 60000) {
          Option1Arr.push(marker());
        } else if (res.Avg_Price >= 60000 && res.Avg_Price <= 90000) {
          Option2Arr.push(marker());
        } else if (res.Avg_Price >= 90000) {
          Option3Arr.push(marker());
        }
      });

      // Create layer groups to split data for NSFAS
      let NSFASYesLayer = L.layerGroup(NSFASYes);
      let NSFASNoLayer = L.layerGroup(NSFASNo);
      let All = NSFASYes.concat(NSFASNo);
      var AllLayer = L.layerGroup(All).addTo(map);

      //Budget Layers
      let Option1Layer = L.layerGroup(Option1Arr);
      let Option2Layer = L.layerGroup(Option2Arr);
      let Option3Layer = L.layerGroup(Option3Arr);

      //Layer control
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
        },
      });
      controlSearch.addTo(map);

      // Filter with BUTTONS
      $("#btn-all").click(function () {
        map.removeLayer(NSFASYesLayer);
        map.removeLayer(NSFASNoLayer);
        map.removeLayer(Option1Layer);
        map.removeLayer(Option2Layer);
        map.removeLayer(Option3Layer);
        map.addLayer(AllLayer);
      });

      $("#btn-yes").click(function () {
        map.removeLayer(NSFASNoLayer);
        map.removeLayer(AllLayer);
        map.removeLayer(Option1Layer);
        map.removeLayer(Option2Layer);
        map.removeLayer(Option3Layer);
        map.addLayer(NSFASYesLayer);
      });

      $("#btn-no").click(function () {
        map.removeLayer(NSFASYesLayer);
        map.removeLayer(AllLayer);
        map.removeLayer(Option1Layer);
        map.removeLayer(Option2Layer);
        map.removeLayer(Option3Layer);
        map.addLayer(NSFASNoLayer);
      });

      //Budget button
      $("#budget-btn").click(function () {
        map.removeLayer(NSFASYesLayer);
        map.removeLayer(NSFASNoLayer);
        map.removeLayer(AllLayer);

        if (getOption() == 1) {
          map.removeLayer(Option2Layer);
          map.removeLayer(Option3Layer);
          map.addLayer(Option1Layer);
        } else if (getOption() == 2) {
          map.removeLayer(Option1Layer);
          map.removeLayer(Option3Layer);
          map.addLayer(Option2Layer);
        } else if (getOption() == 3) {
          map.removeLayer(Option1Layer);
          map.removeLayer(Option2Layer);
          map.addLayer(Option3Layer);
        }
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

// var sidePanel = L.control({ position: "topleft" });
// sidePanel.onAdd = function (map) {
//   var div = L.DomUtil.create("div", "side-panel");
//   var sidePanelContent = `
//     <img src="Logo.png"/ style="height: 8vh; width: 12vw">
//     <span class="sidepanel-text">Click buttons below to filter your data</span>
//     <div id="myChart"></div>
//     <div class="btn-group">
//       <button type="button" id="btn-all" class="btn btn-danger">All</button>
//       <button type="button" id="btn-yes" class="btn btn-danger">
//         NSFAS Accredited
//       </button>
//       <button type="button" id="btn-no" class="btn btn-danger">
//         Not NSFAS Accredited
//       </button>
//     </div>

//   `;
//   div.innerHTML = sidePanelContent;
//   return div;
// };
// sidePanel.addTo(map);
