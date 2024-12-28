window.addEventListener("load", function() {
    console.log("Extension loaded");
    async function starty() {
        if ((await browser.storage.local.get("loadeds")).loadeds) {
            console.log("Extension has been loaded before");
        } else {
            // Set bot and item ratings to true
            await browser.storage.local.set({ bot: true, showItemRatings: true, info: true, itemWorth: true, hoursAway: true });

            // Create overlay
            const overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            overlay.style.zIndex = "3050";
            document.body.appendChild(overlay);
            // Create "form"
            const form = document.createElement("div")
            form.style.position = "fixed";
            form.style.top = "50%";
            form.style.left = "50%";
            form.style.transform = "translate(-50%, -50%)";
            form.style.backgroundColor = "white";
            form.style.padding = "2em";
            form.style.borderRadius = "1em";
            form.style.zIndex = "3100";
            form.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.3)";
            form.style.display = "flex";
            form.style.width = "33em";
            form.style.height = "30em";
            form.style.overflow = "auto";
            form.style.flexDirection = "column";
            form.id = "shipyard-benjs-form";
            document.body.appendChild(form);
            overlay.onclick = function() {
                    overlay.remove();
                    form.remove();
                }
                // Close button
            const close = document.createElement("button");
            close.innerHTML = "X";
            close.style.position = "absolute";
            close.style.top = "1em";
            close.style.right = "1em";
            close.style.backgroundColor = "white";
            close.style.border = "none";
            close.style.borderRadius = "50%";
            close.style.width = "2em";
            close.style.height = "2em";
            close.style.cursor = "pointer";
            close.onclick = function() {
                overlay.remove();
                form.remove();
            }
            form.appendChild(close);
            // Title
            const title = document.createElement("h1");
            title.style.textAlign = "center";
            title.style.width = "100%";
            title.style.fontSize = "2em";
            title.style.userSelect = "none";
            title.innerHTML = "Thanks for installing!";
            form.appendChild(title);
            // Text
            const t1 = document.createElement("p");
            t1.innerHTML = `Thanks for installing my extension! I hope you enjoy. There are a few features that I've included here.`
            form.appendChild(t1);
            const t2 = document.createElement("p");
            t2.innerHTML = `On the Shipyard page:`
            form.appendChild(t2);
            const t3 = document.createElement("p");
            t3.innerHTML = `&nbsp;&nbsp;- You can click the bot icon in the bottom left to generate ideas for projects.`
            form.appendChild(t3);
            const t4 = document.createElement("p");
            t4.innerHTML = `&nbsp;&nbsp;- You can see your average ratings and doubloons per hour at the top of the page.`
            form.appendChild(t4);
            const t5 = document.createElement("p");
            t5.innerHTML = `&nbsp;&nbsp;- You can see how each project was rated.`
            form.appendChild(t5);
            const t6 = document.createElement("p");
            t6.innerHTML = `In the shop:`
            form.appendChild(t6);
            const t7 = document.createElement("p");
            t7.innerHTML = `&nbsp;&nbsp;- You can see how many hours it will take to get a certain item.`
            form.appendChild(t7);
            const t8 = document.createElement("p");
            t8.innerHTML = `&nbsp;&nbsp;- You can see how many hours away you are from getting a certain item.`
            form.appendChild(t8);
            const t9 = document.createElement("p");
            t9.innerHTML = `I hope you enjoy the extension! Any issues or feedback, ping me @Barxilly on the Slack.`
            form.appendChild(t9);
            const t10 = document.createElement("p");
            t10.innerHTML = `If you need to disable/change some features, see the popup.`
            form.appendChild(t10);

            const ts = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10];
            ts.forEach(t => {
                t.style.marginTop = "1em";
                t.style.marginBottom = "0em";
                t.style.userSelect = "none";
            })

            await browser.storage.local.set({
                loadeds: true
            });
        }
    }

    starty();

    setInterval(async function() {
        var elements = document.querySelectorAll("[id^='shipped-ship-']");
        if (elements.length === 0) {
            return;
        }
        const doubloons = []
        const projects = []
        const times = []
        const gringles = document.querySelectorAll(".gringle");
        if (gringles.length > 0 || elements.length === 0) {
            return;
        }
        elements.forEach(async function(element) {
            const time = element.querySelector("div > div.flex-grow > div > span:nth-child(1)").querySelector("span").innerText.split(" hr")[0];
            const doubs = element.querySelector("div > div.flex-grow > div > span:nth-child(2)").querySelector("span").innerText.split(" Doubloon")[0];
            const name = element.querySelector(".text-xl.font-semibold").innerText;
            console.log(time, doubs);
            if (doubs.includes("Pending") || doubs.includes("other")) {
                /*let potentialMax = (time * 25).toFixed(0);
                console.log((await browser.storage.local.get("blessing")).blessing)
                console.log((await browser.storage.local.get("curse")).curse)
                if ((await browser.storage.local.get("blessing")).blessing) {
                    potentialMax *= 1.2
                } else if ((await browser.storage.local.get("curse")).curse) {
                    potentialMax *= 0.5
                }
                console.log(element);
                const staged = document.querySelectorAll("[id^='staged-ship-']");
                let theone;
                staged.forEach(function(stage) {
                    if (stage.innerHTML.includes(name)) {
                        theone = stage;
                    }
                })
                const butty = theone.querySelector("#ship-ship");
                butty.innerHTML = `<img class="iconbadge" src="https://github.com/barxilly/Hackclub-Ratings/blob/main/site/hcrt.png?raw=true" style="width:20px; margin-right: 5px;">Max Reward: ${potentialMax} Doubloons`;
                theone.innerHTML = theone.innerHTML.replace("Pending", time + " hrs");*/
                return;
            }
            const timeFloat = parseFloat(time);
            times.push(timeFloat);
            const doubsInt = parseInt(doubs);
            doubloons.push(doubsInt);
            const doubsPerHour = doubsInt / timeFloat;
            const percentage = (doubsPerHour / 25) * 100;
            let fraction = Math.round(percentage / 10);
            // Fraction is a score out of 10
            if (fraction > 10) {
                fraction = 10;
            }

            const containDiv = element.querySelector(".items-start .gap-2");
            const newSpan = document.createElement("span");
            newSpan.className = "inline-flex items-center gap-1 rounded-full px-2 border text-sm leading-none text-gray-600 bg-green-350 border-gray-500/10 gringle";
            if (fraction < 4) newSpan.style.backgroundColor = "rgba(255, 50, 50, 0.5)";
            if (fraction >= 4 && fraction < 7) newSpan.style.backgroundColor = "rgba(245, 235, 121, 0.5)";
            if (fraction >= 7) newSpan.style.backgroundColor = "rgba(50, 255, 50, 0.5)";
            newSpan.innerHTML = `<img class="iconbadge" src="https://github.com/barxilly/Hackclub-Ratings/blob/main/site/hcrt.png?raw=true" style="width:20px;"><span class='inline-block py-1'>` + fraction + `/10</span>`;
            if (await browser.storage.local.get("showItemRatings") && (await browser.storage.local.get("showItemRatings")).showItemRatings) {
                containDiv.appendChild(newSpan);
            } else if (!(await browser.storage.local.get("showItemRatings"))) {
                browser.storage.local.set({
                    showItemRatings: true
                });
            }
            const index = Array.prototype.indexOf.call(elements, element);
            projects.push({
                title: name,
                doubloons: doubsInt,
                rating: fraction,
                time: timeFloat
            })
        });
        const head = document.querySelector(" div > div.mt-6 > div.w-full.relative > div");
        const totalDoubs = doubloons.reduce((a, b) => a + b, 0);
        const totalTime = times.reduce((a, b) => a + b, 0);
        const totalDoubsPerHour = totalDoubs / totalTime;
        const span = document.createElement("span");
        span.className = "font-heading text-xl mb-6 text-center relative w-fit mx-auto";
        span.style.color = "white";
        span.style.marginTop = "5px";
        span.style.textAlign = "center";
        span.style.justifyContent = "center";
        span.style.display = "flex";
        span.style.width = "100%";
        span.innerHTML = "<br>Average: " + totalDoubsPerHour.toFixed(2) + " Doubloons per hour<br>Average Rating: " + (totalDoubsPerHour / 25 * 10).toFixed(0) + "/10";
        if (document.body.innerHTML.includes("Average:")) return;
        if (await browser.storage.local.get("info") && (await browser.storage.local.get("info")).info) {
            head.appendChild(span);
            const h2 = head.querySelectorAll("div")[0];
            head.insertBefore(span, h2);
        }
        browser.storage.local.set({
            doubloonsPerHour: totalDoubsPerHour,
            projects: projects
        });
    }, 1500);
    setInterval(function() {
        if (window.location.href.includes('wonderdome')) {
            if (!document.querySelector(' div > div > header > div > span > span')) return;
            if (document.querySelector(' div > div > header > div > span > span').innerHTML.includes("blessing")) {
                browser.storage.local.set({
                    blessing: true
                });
                console.log("blessing");
            } else if (document.querySelector(' div > div > header > div > span > span').innerHTML.includes("curse")) {
                browser.storage.local.set({
                    curse: true
                });
                console.log("curse");
            }
        }
        var elements = document.querySelectorAll("[id^='item_']");
        if (elements.length === 0) {
            return;
        }
        var e = document.querySelector("e");
        if (e) {
            return;
        }
        browser.storage.local.get("doubloonsPerHour").then((result) => {
            const doubloonsPerHour = result.doubloonsPerHour;
            elements.forEach(async function(element) {
                const price = element.querySelector(".text-green-500.font-semibold.flex.items-center").innerText.split(" ")[0];
                const priceInt = parseInt(price);
                const hours = priceInt / doubloonsPerHour;
                const span = element.querySelector(".text-xs.text-gray-600");
                if (await browser.storage.local.get("itemWorth") && (await browser.storage.local.get("itemWorth")).itemWorth) {
                    span.innerHTML = `<div style="display:flex;flex-direction:row;"><img class="iconbadge" src="https://github.com/barxilly/Hackclub-Ratings/blob/main/site/hcrt.png?raw=true" style="width:15px;height:15px;margin-right:2px;">(` + hours.toFixed(2) + ` hrs worth)</div>`;
                }
                const buttons = element.querySelectorAll("button:disabled");
                if (buttons.length === 0 || buttons[0].innerHTML.includes("soon")) {
                    return;
                }
                let curdubs = document.querySelector("body > main > div.rounded-lg.bg-card.text-card-foreground.shadow-sm.bg-blend-color-burn.w-full.max-w-4xl.flex.flex-col.mx-auto.mt-20.overflow-x-hidden.mb-14 > div > div > div.inline-flex.items-center.justify-center.rounded-md.bg-muted.p-1.text-muted-foreground.bg-blend-color-burn.mx-2.my-2.relative.h-16 > div > div:nth-child(1) > div > div > span").innerText.split(" ")[0];
                curdubs = parseInt(curdubs);
                for (let i = 0; i < buttons.length; i++) {
                    let diff = priceInt - curdubs;
                    let time = diff / doubloonsPerHour;
                    let button = buttons[i];
                    if (await browser.storage.local.get("hoursAway") && (await browser.storage.local.get("hoursAway")).hoursAway) {
                        button.innerHTML = `<img class="iconbadge" src="https://github.com/barxilly/Hackclub-Ratings/blob/main/site/hcrt.png?raw=true" style="width:20px; margin-right: 5px;">` + time.toFixed(0) + ` hrs away`;
                    }
                }
            });
        });
    }, 1300);
    setInterval(async function() {
        const doubloonImages = document.querySelectorAll("img[alt='doubloons']");
        for (let i = 0; i < doubloonImages.length; i++) {
            const doubloonImage = doubloonImages[i];
            doubloonImage.style.aspectRatio = "1/1 !important";
            doubloonImage.style.height = "auto";
        }
        const buttont = document.querySelector(".shipyard-benjs-button");
        if (!(await browser.storage.local.get("bot"))) {
            browser.storage.local.set({
                bot: true
            });
        }
        if (window.location.href.includes('shipyard') && !buttont && (await browser.storage.local.get("bot")).bot) {
            const button = document.createElement("button");
            button.classList.add("shipyard-benjs-button");
            button.onclick = async function() {
                function typewriterType(text, speed, element) {
                    let i = 0;
                    let interval = setInterval(() => {
                        if (i === text.length) {
                            clearInterval(interval);
                            return;
                        }
                        element.innerHTML += text[i];
                        i++;
                    }, speed);
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, text.length * speed);
                    });
                }
                const overlay = document.createElement("div");
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100%";
                overlay.style.height = "100%";
                overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                overlay.style.zIndex = "3050";
                document.body.appendChild(overlay);
                const form = document.createElement("div")
                form.style.position = "fixed";
                form.style.top = "50%";
                form.style.left = "50%";
                form.style.transform = "translate(-50%, -50%)";
                form.style.backgroundColor = "white";
                form.style.padding = "2em";
                form.style.borderRadius = "1em";
                form.style.zIndex = "3100";
                form.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.3)";
                form.style.display = "flex";
                form.style.width = "33em";
                form.style.height = "30em";
                form.style.overflow = "auto";
                form.style.flexDirection = "column";
                form.id = "shipyard-benjs-form";
                document.body.appendChild(form);
                overlay.onclick = function() {
                    overlay.remove();
                    form.remove();
                }
                const close = document.createElement("button");
                close.innerHTML = "Close";
                close.style.position = "absolute";
                close.style.top = "1em";
                close.style.right = "1em";
                close.innerHTML = 'X'
                close.style.backgroundColor = "white";
                close.style.border = "none";
                close.style.borderRadius = "50%";
                close.style.width = "2em";
                close.style.height = "2em";
                close.style.cursor = "pointer";
                close.onclick = function() {
                    overlay.remove();
                    form.remove();
                }
                form.appendChild(close);
                const title = document.createElement("h1");
                title.style.textAlign = "center";
                title.style.width = "100%";
                title.style.fontSize = "2em";
                title.style.userSelect = "none";
                form.appendChild(title);
                const t1 = document.createElement("p");
                t1.style.marginTop = "1em";
                t1.style.marginBottom = "1em";
                t1.style.userSelect = "none";
                form.appendChild(t1);
                const s1 = document.createElement("sup");
                s1.style.fontSize = "0.8em";
                s1.style.color = "gray";
                s1.style.marginTop = "0.2em";
                s1.style.userSelect = "none";
                form.appendChild(s1);
                const keyin = document.createElement("input");
                keyin.style.width = "100%";
                keyin.style.height = "2.5em";
                keyin.style.marginTop = "1em";
                keyin.style.marginBottom = "0.3em";
                keyin.style.border = "1px solid black";
                keyin.style.borderRadius = "0.5em";
                keyin.style.padding = "0.5em";
                keyin.style.display = "none";
                keyin.type = "password";
                form.appendChild(keyin);
                const ketinerr = document.createElement("p");
                ketinerr.style.color = "red";
                ketinerr.style.display = "none";
                ketinerr.style.marginTop = "0.3em";
                ketinerr.style.marginBottom = "0.3em";
                ketinerr.style.userSelect = "none";
                form.appendChild(ketinerr);
                const keybut = document.createElement("button");
                keybut.classList.add("shipyard-benjs-keybut");
                keybut.style.width = "100%";
                keybut.style.height = "2.5em";
                keybut.style.marginTop = "0.5em";
                keybut.style.marginBottom = "1em";
                keybut.style.border = "1px solid black";
                keybut.style.borderRadius = "0.5em";
                keybut.style.padding = "0.5em";
                keybut.style.lineHeight = "1";
                keybut.style.backgroundColor = "white";
                keybut.style.cursor = "pointer";
                keybut.style.display = "none";
                keybut.innerHTML = "Submit";
                form.appendChild(keybut);
                keybut.onclick = async function() {
                    keybut.innerHTML = `
                        <img src="https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/cupertino_activity_indicator.gif" style="width: 1.5em; height: 1.5em; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    `
                    keybut.disabled = true;
                    keybut.style.justifyContent = "center";
                    const key = keyin.value;
                    const response = await fetch("https://api.github.com/user", {
                        headers: {
                            Authorization: `token ${key}`
                        }
                    });
                    if (response.status !== 200) {
                        ketinerr.innerHTML = "Invalid key";
                        ketinerr.style.display = "block";
                        keybut.innerHTML = "Submit";
                        keybut.disabled = false;
                        return;
                    }
                    const urlai = "https://models.inference.ai.azure.com/chat/completions";
                    const modelName = "gpt-4o-mini";
                    const responseai = await axios.post(
                        urlai, {
                            messages: [{
                                    role: 'system',
                                    content: 'Say hi',
                                },
                                {
                                    role: 'user',
                                    content: 'hi',
                                },
                            ],
                            temperature: 0.5,
                            max_tokens: 1024,
                            top_p: 1,
                            model: modelName,
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${key}`,
                            }
                        }
                    );
                    console.log(responseai);
                    if (responseai.status !== 200) {
                        ketinerr.innerHTML = "You don't have models access";
                        ketinerr.style.display = "block";
                        keybut.innerHTML = "Submit";
                        keybut.disabled = false;
                        return;
                    }
                    keybut.innerHTML = "Success!";
                    browser.storage.local.set({
                        key: key
                    });
                    setTimeout(() => {
                        overlay.remove();
                        form.remove();
                        button.click();
                    }, 500);
                }
                await typewriterType("Generate Ideas (GPT-4o)", 1, title)
                const keytest = (await browser.storage.local.get("key")).key;
                console.log(keytest);
                if (!keytest || keytest.length < 9) {
                    await typewriterType("First things first, I'll need your GitHub API Key", 30, t1);
                    await typewriterType("You'll need GitHub Models Access too. (I'll save this key for later)", 30, s1);
                    keyin.style.display = "block";
                } else {
                    await typewriterType("You're all set! Click the button to generate ideas", 30, t1);
                    keybut.innerHTML = "Generate";
                    keybut.onclick = async function() {
                        keybut.style.position = "relative";
                        keybut.innerHTML = `
                        <img src="https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/cupertino_activity_indicator.gif" style="width: 1.5em; height: 1.5em; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    `
                        keybut.disabled = true;
                        keybut.style.justifyContent = "center";
                        const projects = await browser.storage.local.get("projects");
                        const system = `You are going to be given some projects, how many doubloons they earned, how well they rated, and how long they took to make.
                        Generate new ideas based on what works well.
                        
                        Give your answer in the format:
                        <idea name>: <description of idea>. Work on it for <hours>. I predict it will get a <num>/10 rating.
                        Give around 10 ideas. Make sure they are new, and not just repeated from the list or updated versions of projects.
                        `
                        let prompt = ""
                        for (let i = 0; i < projects.projects.length; i++) {
                            const project = projects.projects[i];
                            prompt += `Project ${i + 1}: ${project.title}\nDoubloons: ${project.doubloons}\nRating: ${project.rating}/10\nTime: ${project.time} hours\n\n`
                        }
                        const urlai = "https://models.inference.ai.azure.com/chat/completions";
                        const modelName = "gpt-4o-mini";
                        const key = (await browser.storage.local.get("key")).key;
                        console.log(key);
                        const responseai = await axios.post(
                            urlai, {
                                messages: [{
                                        role: 'system',
                                        content: system,
                                    },
                                    {
                                        role: 'user',
                                        content: prompt,
                                    },
                                ],
                                temperature: 0.5,
                                max_tokens: 1024,
                                top_p: 1,
                                model: modelName,
                            }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${key}`,
                                }
                            }
                        );
                        console.log(responseai.data.choices[0]);
                        keybut.display = "none";
                        keybut.style.opacity = 0;
                        t1.innerText = ""
                        const response = responseai.data.choices[0].message.content;
                        let html = response.replace(/\n/g, "<br>");
                        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                        t1.innerHTML = html;
                    }
                }
                keybut.style.display = "block";
            }
            button.innerHTML = `
                <img class="boticon" src=\"https://www.svgrepo.com/show/310389/bot.svg\" style=\"width: 160%; height: 60%;\">
                <img class="iconbadge" src="https://lh3.googleusercontent.com/RhhITLSfPbbqI4rbdtyhTWKsCglCYptrVeKBT0ONGrqUqawj5eMWen2-t-8w_WTSLcyl4kXXB1nUZOvzvNc0uR02Mg=s32" style="width: 25%; height: 25%; position: absolute; top: 2.7em; right: 1em; border-radius: 50%;">
            `;
            const spann = document.createElement("span")
            spann.innerHTML = "Generate Ideas (unofficial)"
            button.appendChild(spann);
            document.body.appendChild(button);
            const butstyle = document.createElement("style");
            butstyle.innerHTML = `
                .shipyard-benjs-button {
                    width: 5em;
                    height: 5em;
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    z-index: 3000;
                    background-color: white;
                    border: 2px solid red;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                }
                
                .shipyard-benjs-button:hover {
                    background-color: #f0f0f0;
                    transform: translateY(-5px);
                    box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
                }
                .shipyard-benjs-button * {
                    transform: rotate(0deg);
                    transition: all 0.2s ease-in-out;
                }
                .shipyard-benjs-button:hover *:not(span) {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                } 
                .shipyard-benjs-button span {
                    display: none;
                    position: absolute;
                    top: -5em;
                    right: 0;
                    background-color: #f0f0f0;
                    padding: 0.5em;
                    border-radius: 0.5em;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                    z-index: 2000;
                    font-size: 0.8em;
                }
                .shipyard-benjs-button:hover span {
                    display: block;
                }
                .shipyard-benjs-keybut {
                    transition: all 0.2s ease-in-out;
                }
                .shipyard-benjs-keybut:hover {
                    background-color: #f0f0f0;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }
                .shipyard-benjs-keybut:disabled {
                    cursor: not-allowed;
                    background-color: #eeeeee !important;
                    box-shadow: 0;
                }
                .shipyard-benjs-keybut:disabled:hover {
                    transform: none;
                    box-shadow: 0;
                }
                /* Scrollbar */
                #shipyard-benjs-form::-webkit-scrollbar {
                    border-radius: 0.3em;
                    width: 1em;
                }
                #shipyard-benjs-form::-webkit-scrollbar-thumb {
                    background-color: #888;
                    border-radius: 0.3em;
                }
                #shipyard-benjs-form::-webkit-scrollbar-thumb:hover {
                    background-color: #555;
                }
            `
            document.head.appendChild(butstyle);
        } else if (!window.location.href.includes('shipyard')) {
            if (buttont) {
                buttont.remove();
            }
        }
    }, 100);
});