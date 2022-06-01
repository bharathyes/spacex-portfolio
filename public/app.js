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
    body: '{"query":"{\\n  launches {\\n    mission_name\\n    id\\n    details\\n    launch_success\\n    launch_year\\n    launch_date_utc\\n    rocket {\\n      rocket_name\\n      rocket_type\\n    }\\n    launch_site {\\n      site_name_long\\n    }\\n    static_fire_date_utc\\n  }\\n  rockets {\\n    name\\n    id\\n    description\\n    type\\n    active\\n    country\\n    first_flight\\n    cost_per_launch\\n    height {\\n      meters\\n    }\\n    mass {\\n      kg\\n    }\\n    boosters\\n    stages\\n    engines {\\n      number\\n      propellant_1\\n      propellant_2\\n      thrust_to_weight\\n      version\\n      type\\n    }\\n    first_stage {\\n      reusable\\n      fuel_amount_tons\\n      engines\\n      burn_time_sec\\n    }\\n    second_stage {\\n      burn_time_sec\\n      engines\\n      fuel_amount_tons\\n    }\\n    success_rate_pct\\n    wikipedia\\n  }\\n  capsules {\\n    id\\n    type\\n    landings\\n    status\\n    missions {\\n      name\\n    }\\n    original_launch\\n    reuse_count\\n  }\\n  landpads {\\n    id\\n    full_name\\n    details\\n    location {\\n      name\\n    }\\n    status\\n    attempted_landings\\n    successful_landings\\n    landing_type\\n    wikipedia\\n  }\\n\\t  ships {\\n    name\\n    image\\n    url\\n    id\\n    type\\n    class\\n    speed_kn\\n    weight_kg\\n    year_built\\n    attempted_landings\\n    successful_landings\\n    status\\n  }\\n}\\n"}',
  });

  let data = await response.json();

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
        let title = document.createElement("h2");
        arrItem.setAttribute("id", value);
        title.innerHTML = value;
        arrItem.appendChild(title);
      } else {
        var para = document.createElement("p");
        var keySpan = document.createElement("span");
        var valueSpan = document.createElement("span");
        keySpan.innerHTML = key;
        if (typeof value === "object") {
          valueSpan.innerHTML = "  " + JSON.stringify(value);
        } else if (key.match(".*date.*")) {
          valueSpan.innerHTML = new Date(value).toLocaleDateString();
        } else if (key.match("(url|wikipedia)")) {
          valueSpan.innerHTML = `<a href="${value}" target="_blank">${value}</a>`;
        } else {
          valueSpan.innerHTML = "  " + value;
        }
        para.appendChild(keySpan);
        para.appendChild(valueSpan);
        if (key.match(".*image.*")) {
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

document
  .getElementById("shipsButton")
  .addEventListener("click", async () => {
    let data = JSON.parse(localStorage.getItem("shipsData"));
    renderData(data, "ship");
    window.scrollTo(0, 0);
  });

renderData(JSON.parse(localStorage.getItem("launchData")), "launch");
