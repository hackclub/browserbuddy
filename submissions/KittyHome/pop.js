const pomodoro_kitty = document.getElementById("pomodoro_kitty");

const cat_ipsum = document.getElementById("cat_ipsum");

const to_do = document.getElementById("to_do");

const chrome_cat = document.getElementById("chrome_cat");

const cat_follow_mouse = document.getElementById("cat_follow_mouse");

const cat_study_timer = document.getElementById("cat_study_timer");


pomodoro_kitty.addEventListener("click", pomodoro_kitty_open);

cat_ipsum.addEventListener("click", cat_ipsum_open);

to_do.addEventListener("click", to_do_open);

chrome_cat.addEventListener("click", chrome_cat_open);

cat_follow_mouse.addEventListener("click", cat_follow_mouse_open);

cat_study_timer.addEventListener("click", cat_study_timer_open);


function pomodoro_kitty_open() {
    window.open("https://pomodorokitty.com/");
}

function cat_ipsum_open() {
    window.open("http://www.catipsum.com");
}

function to_do_open() {
    window.open("./todo.html", "_blank");
}

function chrome_cat_open() {
    window.open("https://chromecat.app/");
}

function cat_follow_mouse_open() {
    window.open("https://github.com/crabby605/Cat-follow-mouse-real");
}

function cat_study_timer_open() {
    window.open("https://study.sticks.gay");
}