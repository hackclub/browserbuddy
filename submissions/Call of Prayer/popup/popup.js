console.log("IT IS LOADED");
function yes(){
    chrome.storage.local.set({ Alarm: "ON" });
    document.getElementById("status").innerHTML = "On";
}
function no(){
    chrome.storage.local.set({ Alarm: "OFF" });
    document.getElementById("status").innerHTML = "Off";
}
function position() {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        chrome.storage.local.set({ latitude, longitude });
        window.alert(`Location Saved: ${latitude}, ${longitude}. Now refresh the page.`);
        chrome.runtime.sendMessage( {message: "datafetching"});
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
};

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
chrome.storage.local.get("counting_method", (data) => {
    const selectedValue = data.counting_method;
    if (selectedValue) {
      document.getElementById("counting_method").value = selectedValue;
    }
  });
  document.getElementById("counting_method").addEventListener("change", function() {
    const counting_method = this.value;
    chrome.storage.local.set({ counting_method });  
  });
    document.getElementById("yes").addEventListener("click", yes);
    document.getElementById("no").addEventListener("click", no);
    
    document.getElementById("Setup_Location").addEventListener("click", position);
    document.getElementById("Clear_Data").addEventListener("click", clear);
    chrome.storage.local.get(["Alarm","fajr_time","Duhr_time", "Asr_time", "maghrib_time", "Isha_time", "city", "country"], ({Alarm, fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time, city, country}) => {
        if (fajr_time && Duhr_time && Asr_time && maghrib_time && Isha_time) {
            update(fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time);
        }
        else{
            chrome.runtime.sendMessage( {message: "datafetching"});
        }
        if (city && country) {
            document.getElementById("Location").innerHTML = `${city}, ${country}`;
        }
        else{
            country_fetching();
        }
        if (Alarm == "ON") {
            document.getElementById("status").innerHTML = "On";
        }
        else{
            document.getElementById("status").innerHTML = "Off";
        }
    });

})
