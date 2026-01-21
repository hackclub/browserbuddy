let start_button = document.getElementById("start-button");
let next_button = document.getElementById("next-button");
let content_div = document.getElementById("content-div");
let main_div = document.getElementById("main-div");
let facts_content = document.getElementById("fact-content");
let fact_number = document.getElementById("fact-number");
let i = 0;
let facts_list = ["Hack Club welcomes beginners. Many students start with zero experience and learn everything with the help of others.", "Hack Club is for high school students only! It’s a global community where teenagers learn coding together — no adults running the show.", "Everything is open source — you can see and edit real code. Even Hack Club’s own website and tools are public on GitHub, so you can learn by looking at real projects.", "You can build real websites, games, and apps with others. Hack Club has tutorials like Workshops that teach you how to make your first site, game, or app.", "Hack Club helps you host real hackathons (for free!). They’ll even help you get sponsors and manage money legally through something called Hack Club Bank."]
start_button.onclick = function(){
    content_div.style.display = "block";
    main_div.style.display = "none";
    
}
next_button.onclick = function(){
    
    facts_content.innerHTML = facts_list[i];
    i++;
    if(i == 5){
        i = 0;
    }
}