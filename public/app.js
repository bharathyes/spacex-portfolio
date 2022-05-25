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
async function fetchLaunchData() {
  console.log("Fetching API data...");
  const Url = "https://api.spacex.land/graphql/";

  let response = await fetch(Url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: '{"query":"{\\n  launches(limit: 5, offset: 10) {\\n    launch_date_utc\\n    launch_year\\n    launch_success\\n    rocket {\\n      rocket_name\\n      rocket_type\\n    }\\n    details\\n    id\\n    launch_site {\\n      site_name_long\\n      site_id\\n    }\\n    mission_name\\n  }\\n}"}',
  });
  return response;
}

// get data from local storage else fetch from server
async function getLaunchData() {
  console.log("Getting data from local storage...");
  let data = localStorage.getItem("launchData");
  if (!data) {
    return fetchLaunchData().then((response) => {
      data = response;
      localStorage.setItem("launchData", data);
      return data;
    });
  }
  return data;
}

getLaunchData().then((data) => {
  console.log(data);
});
