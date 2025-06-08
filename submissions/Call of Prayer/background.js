function alarm(){
chrome.storage.local.get(["Alarm","fajr_time", "Duhr_time", "Asr_time", "maghrib_time", "Isha_time"], ({Alarm,fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time}) => {
if (Alarm == "ON") {
    const convertToDate = (timeString) => {
        const [hours, minutes] = timeString.split(":").map(Number);
        const now = new Date();
        now.setHours(hours, minutes, 0, 0);

        const prayerTime = new Date(now);
        if (prayerTime < new Date()) {
            prayerTime.setDate(prayerTime.getDate() + 1);
        }

        return prayerTime;
    };

    const fajr = convertToDate(fajr_time);
    const duhr = convertToDate(Duhr_time);
    const asr = convertToDate(Asr_time);
    const maghrib = convertToDate(maghrib_time);
    const isha = convertToDate(Isha_time);

    function checkAlarms() {
        const now = new Date();
        const prayerTimes = {
            "Fajr": fajr,
            "Duhr": duhr,
            "Asr": asr,
            "Maghrib": maghrib,
            "Isha": isha,
        };

        for (const [prayerName, prayerTime] of Object.entries(prayerTimes)) {
            if (now >= prayerTime && now < new Date(prayerTime.getTime() + 120000)) {
                chrome.notifications.create(prayerName, {
                    type: "basic",
                    iconUrl: "icon/muslim (2)",
                    title: `Time for ${prayerName} prayer!`,
                    message: `It's time to perform ${prayerName} prayer.`,
                });
            }
        }
    }
    setInterval(checkAlarms, 60000);
    console.log("Alarm is On");
}
else{
    console.log("Alarm is Off");
}
});
}
function datafetching(){
    console.log("Data Fetching");
    chrome.storage.local.get(["latitude", "longitude", "counting_method"], ({latitude, longitude, counting_method}) => {
        if (latitude && longitude) {
            
            fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${counting_method}`)
            .then(response => response.json())
            .then(data => {
                const fajr_time = data.data.timings.Fajr;
                const Duhr_time = data.data.timings.Dhuhr;
                const Asr_time = data.data.timings.Asr;
                const maghrib_time = data.data.timings.Maghrib;
                const Isha_time = data.data.timings.Isha;
                chrome.storage.local.set({ fajr_time, Duhr_time, Asr_time, maghrib_time, Isha_time });
            })
            .catch(error => console.error("Error fetching prayer times:", error))
        }
    else{
        window.alert("Location Not Set. Set the location and refresh the page");
    }
});}
setInterval(datafetching, 60000);
chrome.runtime.onMessage.addListener(data =>{
    switch(data.message){
        case "datafetching":
            datafetching();
            break;
    }
})
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.Alarm) {
        const newAlarmStatus = changes.Alarm.newValue;
            if (newAlarmStatus === "ON") {
                alarm();
            } else {
                console.log("Alarm is Off");
            }
        }
});