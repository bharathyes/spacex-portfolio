const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "/",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();

// fetch data from server
async function fetchApiData() {
  console.log("Fetching API data...");
  const Url = "https://api.spacex.land/graphql/";

  let response = await fetch(Url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: '{"query":"{\\n\\tlaunchLatest {\\n\\t\\tid\\n\\t\\tupcoming\\n\\t\\tmission_name\\n\\t\\tlinks {\\n\\t\\t\\tflickr_images\\n\\t\\t\\treddit_media\\n\\t\\t\\tvideo_link\\n\\t\\t}\\n\\t\\tdetails\\n\\t\\tlaunch_date_utc\\n\\t\\tlaunch_site {\\n\\t\\t\\tsite_name_long\\n\\t\\t}\\n\\t\\tlaunch_success\\n\\t}\\n\\tlaunches {\\n\\t\\tmission_name\\n\\t\\tid\\n\\t\\tdetails\\n\\t\\tlaunch_success\\n\\t\\tlaunch_year\\n\\t\\tlaunch_date_utc\\n\\t\\trocket {\\n\\t\\t\\trocket_name\\n\\t\\t\\trocket_type\\n\\t\\t}\\n\\t\\tlaunch_site {\\n\\t\\t\\tsite_name_long\\n\\t\\t}\\n\\t\\tstatic_fire_date_utc\\n\\t}\\n\\trockets {\\n\\t\\tname\\n\\t\\tid\\n\\t\\tdescription\\n\\t\\ttype\\n\\t\\tactive\\n\\t\\tcountry\\n\\t\\tfirst_flight\\n\\t\\tcost_per_launch\\n\\t\\theight {\\n\\t\\t\\tmeters\\n\\t\\t}\\n\\t\\tmass {\\n\\t\\t\\tkg\\n\\t\\t}\\n\\t\\tboosters\\n\\t\\tstages\\n\\t\\tengines {\\n\\t\\t\\tnumber\\n\\t\\t\\tpropellant_1\\n\\t\\t\\tpropellant_2\\n\\t\\t\\tthrust_to_weight\\n\\t\\t\\tversion\\n\\t\\t\\ttype\\n\\t\\t}\\n\\t\\tfirst_stage {\\n\\t\\t\\treusable\\n\\t\\t\\tfuel_amount_tons\\n\\t\\t\\tengines\\n\\t\\t\\tburn_time_sec\\n\\t\\t}\\n\\t\\tsecond_stage {\\n\\t\\t\\tburn_time_sec\\n\\t\\t\\tengines\\n\\t\\t\\tfuel_amount_tons\\n\\t\\t}\\n\\t\\tsuccess_rate_pct\\n\\t\\twikipedia\\n\\t}\\n\\tcapsules {\\n\\t\\tid\\n\\t\\ttype\\n\\t\\tlandings\\n\\t\\tstatus\\n\\t\\tmissions {\\n\\t\\t\\tname\\n\\t\\t}\\n\\t\\toriginal_launch\\n\\t\\treuse_count\\n\\t}\\n\\tlandpads {\\n\\t\\tfull_name\\n\\t\\tid\\n\\t\\tdetails\\n\\t\\tlocation {\\n\\t\\t\\tname\\n\\t\\t}\\n\\t\\tstatus\\n\\t\\tattempted_landings\\n\\t\\tsuccessful_landings\\n\\t\\tlanding_type\\n\\t\\twikipedia\\n\\t}\\n\\tships {\\n\\t\\tname\\n\\t\\timage\\n\\t\\turl\\n\\t\\tid\\n\\t\\ttype\\n\\t\\tclass\\n\\t\\tweight_kg\\n\\t\\tyear_built\\n\\t}\\n}\\n"}',
  });

  let data = await response.json();

  // localStorage.setItem(
  //   "upcomingLaunchData",
  //   JSON.stringify(data.data.upcominglaunches)
  // );
  localStorage.setItem("launchData", JSON.stringify(data.data.launches));
  localStorage.setItem("rocketsData", JSON.stringify(data.data.rockets));
  localStorage.setItem("capsulesData", JSON.stringify(data.data.capsules));
  localStorage.setItem("landpadsData", JSON.stringify(data.data.landpads));
  localStorage.setItem("shipsData", JSON.stringify(data.data.ships));
}

let reloadTestData = localStorage.getItem("rocketsData");
if (reloadTestData === null) {
  await fetchApiData();
}

function jsonDecoratedString(obj) {
  let json = JSON.parse(obj);
  let mainValueSpan = document.createElement("span");
  if (json === null || json === undefined) {
    return obj;
  }
  Object.entries(json).forEach(([key, value]) => {
    let nestedJson = document.createElement("span");
    nestedJson.classList.add("nested-json");
    nestedJson.innerHTML = `${key}: ${value}`;
    mainValueSpan.appendChild(nestedJson);
  });
  return mainValueSpan.innerHTML;
}

async function renderData(data, type) {
  let titleKey;
  if (type === "launch") {
    titleKey = "mission_name";
  } else if (type.match("(capsule|latestLaunch)")) {
    titleKey = "id";
  } else if (type === "landpad") {
    titleKey = "full_name";
  } else {
    titleKey = "name";
  }
  let coreContainer = document.getElementById("dynamic-content");
  coreContainer.innerHTML = "";

  let sidebarCounter = 0;
  let sideItem = document.getElementById("sidebar-container");
  sideItem.innerHTML = "";

  // traverse response array
  data.forEach((element) => {
    //  add element title to the sidebar
    Object.entries(element).forEach(([key, value]) => {
      if (key === titleKey) {
        let link = document.createElement("a");
        let linkUrl = `#${value}`;
        link.setAttribute("href", linkUrl);

        let title = document.createElement("h3");
        let counterSpan = document.createElement("span");
        let titleSpan = document.createElement("span");
        sidebarCounter++;

        counterSpan.innerHTML = "(" + sidebarCounter + ") ";
        titleSpan.innerHTML = value;

        title.appendChild(counterSpan);
        title.appendChild(titleSpan);

        link.appendChild(title);
        sideItem.appendChild(link);
      }
    });

    // add element to section as paragraph
    let arrItem = document.createElement("div");
    arrItem.setAttribute("class", "dynamic-item");

    Object.entries(element).forEach(([key, value]) => {
      if (key === titleKey) {
        let title = document.createElement("h2");
        arrItem.setAttribute("id", value);
        title.innerHTML = value;
        arrItem.appendChild(title);
      } else {
        var para = document.createElement("p");
        var keySpan = document.createElement("span");
        keySpan.classList.add("key-span");
        var valueSpan = document.createElement("span");
        keySpan.innerHTML = key;
        if (typeof value === "object") {
          valueSpan.innerHTML =
            "  " + jsonDecoratedString(JSON.stringify(value));
          // valueSpan.innerHTML = "  " + JSON.stringify(value);
        } else if (key.match(".*date.*")) {
          valueSpan.innerHTML = new Date(value).toLocaleDateString();
        } else if (key.match("(url|wikipedia)")) {
          valueSpan.innerHTML = `<a href="${value}" target="_blank">${value}</a>`;
        } else {
          valueSpan.innerHTML = "  " + value;
        }
        para.appendChild(keySpan);
        para.appendChild(valueSpan);
        if (key.match(".*image.*") && value !== null) {
          let img = document.createElement("img");
          img.setAttribute("src", value);
          img.setAttribute("alt", value);
          para.setAttribute("class", "image-container");
          para.innerHTML = "";
          para.appendChild(img);
        }
        arrItem.appendChild(para);
      }
    });
    coreContainer.appendChild(arrItem);
  });
}

// document
//   .getElementById("latestLaunchesButton")
//   .addEventListener("click", async () => {
//     let data = JSON.parse(localStorage.getItem("latestLaunchData"));
//     renderData(data, "latestLaunch");
//     window.scrollTo(0, 0);
//   });

document
  .getElementById("launchesButton")
  .addEventListener("click", async () => {
    let data = JSON.parse(localStorage.getItem("launchData"));
    renderData(data, "launch");
    window.scrollTo(0, 0);
  });

document.getElementById("rocketsButton").addEventListener("click", async () => {
  let data = JSON.parse(localStorage.getItem("rocketsData"));
  renderData(data, "rocket");
  window.scrollTo(0, 0);
});

document
  .getElementById("capsulesButton")
  .addEventListener("click", async () => {
    let data = JSON.parse(localStorage.getItem("capsulesData"));
    renderData(data, "capsule");
    window.scrollTo(0, 0);
  });

document
  .getElementById("spacePortButton")
  .addEventListener("click", async () => {
    let data = JSON.parse(localStorage.getItem("landpadsData"));
    renderData(data, "landpad");
    window.scrollTo(0, 0);
  });

document.getElementById("shipsButton").addEventListener("click", async () => {
  let data = JSON.parse(localStorage.getItem("shipsData"));
  renderData(data, "ship");
  window.scrollTo(0, 0);
});

renderData(JSON.parse(localStorage.getItem("launchData")), "launch");

document.getElementById("menuButton").addEventListener("click", () => {
  let menu = document.getElementById("hidden-menu");
  if ( menu.style.display === "block" ) {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }

});