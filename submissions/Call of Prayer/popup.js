console.log("IT IS LOADED");

function position() {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        chrome.storage.local.set({ latitude, longitude });
        window.alert(`Location Saved: ${latitude}, ${longitude}`);
    },
    error => {
        window.alert("Error Getting Location")
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    }
);
}

function clear() {
    chrome.storage.local.clear();
    window.alert("Data Cleared");
}
function country_fetching(){
    chrome.storage.local.get(["latitude", "longitude"], ({latitude, longitude}) => {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(response => response.json())
            .then(data => {
            const city = data.address.state_district;
            const country = data.address.country;
            chrome.storage.local.set({ city, country });
            document.getElementById("Location").innerHTML = `${city}, ${country}`;
            })
            .catch(error => document.getElementById("Location").innerHTML = "Cannot Fetch Location");
        });
}
function datafetching(){
    chrome.storage.local.get(["latitude", "longitude"], ({latitude, longitude}) => {
        if (latitude && longitude) {
            
            fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`)
            .then(response => response.json())
            .then(data => {
                const fajr_time = data.data.timings.Fajr;
                const Duhr_time = data.data.timings.Dhuhr;
                const Asr_time = data.data.timings.Asr;
                const maghrib_time = data.data.timings.Maghrib;
                const Isha_time = data.data.timings.Isha;
                chrome.storage.local.set({ fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time });
                update(fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time);
            })
            .catch(error => console.error("Error fetching prayer times:", error))
        }
    else{
        window.alert("Location Not Set. Set the location and refresh the page");
    }
});
}
function A24to12(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
function update(fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time){
    const suhoor = document.getElementById("Suhoor");
    suhoor.innerHTML = A24to12(fajr_time) || "Not Available";
    const Duhr = document.getElementById("Duhr");
    Duhr.innerHTML = A24to12(Duhr_time) || "Not Available";
    const Asr = document.getElementById("Asr");
    Asr.innerHTML = A24to12(Asr_time) || "Not Available";
    const iftar = document.getElementById("Iftar");
    iftar.innerHTML = A24to12(maghrib_time) || "Not Available";
    const Isha = document.getElementById("Isha");
    Isha.innerHTML = A24to12(Isha_time) || "Not Available";
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("Setup_Location").addEventListener("click", position);
    document.getElementById("Clear_Data").addEventListener("click", clear);
    chrome.storage.local.get(["fajr_time","Duhr_time", "Asr_time", "maghrib_time", "Isha_time", "city", "country"], ({fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time, city, country}) => {
        if (fajr_time && Duhr_time && Asr_time && maghrib_time && Isha_time) {
            update(fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time);
        }
        else{
            datafetching();
        }
        if (city && country) {
            document.getElementById("Location").innerHTML = `${city}, ${country}`;
        }
        else{
            country_fetching();
        }
    });

});
