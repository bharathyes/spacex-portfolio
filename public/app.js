const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/public/sw.js",
        {
          scope: "/public/",
        }
      );
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
    "body": "{\"query\":\"{\\n  launches(limit: 13) {\\n    mission_name\\n    id\\n    details\\n    launch_success\\n    launch_year\\n    launch_date_utc\\n    rocket {\\n      rocket_name\\n      rocket_type\\n    }\\n    launch_site {\\n      site_name_long\\n    }\\n    static_fire_date_utc\\n  }\\n  rockets(limit: 13) {\\n    name\\n    id\\n    description\\n    type\\n    active\\n    country\\n    first_flight\\n    cost_per_launch\\n    height {\\n      meters\\n    }\\n    mass {\\n      kg\\n    }\\n    boosters\\n    stages\\n    engines {\\n      number\\n      propellant_1\\n      propellant_2\\n      thrust_to_weight\\n      version\\n      type\\n    }\\n    first_stage {\\n      reusable\\n      fuel_amount_tons\\n      engines\\n      burn_time_sec\\n    }\\n    second_stage {\\n      burn_time_sec\\n      engines\\n      fuel_amount_tons\\n    }\\n    success_rate_pct\\n    wikipedia\\n  }\\n  capsules(limit: 13) {\\n    id\\n    type\\n    landings\\n    status\\n    missions {\\n      name\\n    }\\n    original_launch\\n    reuse_count\\n  }\\n  landpads(limit: 13) {\\n    full_name\\n    id\\n    details\\n    location {\\n      name\\n    }\\n    status\\n    attempted_landings\\n    successful_landings\\n    landing_type\\n    wikipedia\\n  }\\n}\\n\"}"
  });

  let data = await response.json();

  localStorage.setItem("launchData", JSON.stringify(data.data.launches));
  localStorage.setItem("rocketsData", JSON.stringify(data.data.rockets));
  localStorage.setItem("capsulesData", JSON.stringify(data.data.capsules));
  localStorage.setItem("landpadsData", JSON.stringify(data.data.landpads));
}
await fetchApiData();

async function renderData(data, type) {
  
  let titleKey;
  if (type === "launch") {
    titleKey = "mission_name";
  } else if (type === "capsule") { 
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
        let title = document.createElement("h1");
        arrItem.setAttribute("id", value);
        title.innerHTML = value;
        arrItem.appendChild(title);
      } else {
        var para = document.createElement("p");
        var keySpan = document.createElement("span");
        var valueSpan = document.createElement("span");
        keySpan.innerHTML = key;
        valueSpan.innerHTML = "  " + JSON.stringify(value);
        para.appendChild(keySpan);
        para.appendChild(valueSpan);
        arrItem.appendChild(para);
      }
    });
    coreContainer.appendChild(arrItem);
  });
}

document.getElementById("launchesButton").addEventListener("click", async () => {
  let data = JSON.parse(localStorage.getItem("launchData"));
  renderData(data, "launch");
});

document.getElementById("rocketsButton").addEventListener("click", async () => {
  let data = JSON.parse(localStorage.getItem("rocketsData"));
  renderData(data, "rocket");
});

document.getElementById("capsulesButton").addEventListener("click", async () => {
  let data = JSON.parse(localStorage.getItem("capsulesData"));
  renderData(data, "capsule");
});

document.getElementById("spacePortButton").addEventListener("click", async () => {
  let data = JSON.parse(localStorage.getItem("landpadsData"));
  renderData(data, "landpad");
});



renderData(JSON.parse(localStorage.getItem("launchData")), "launch");