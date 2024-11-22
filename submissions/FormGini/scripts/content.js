(() => {
    function addButtons() {
        let d = document.querySelectorAll("div[data-params]");
        for(var i in d) if(d.hasOwnProperty(i)) {
            let btn = document.createElement('div');
            let ans = document.createElement('ans');
            ans.classList.add('answer');
            btn.classList.add('btn');
            btn.innerHTML = "<img src='"+chrome.runtime.getURL('images/white.png')+"'><div>FormGini</div>"
            let dx = d[i].getAttribute('data-params');
            btn.addEventListener('click', async function() {
                const apiKey = '';
                chrome.storage.sync.get(["apikey"], async function(items){
                    if(items && items != {} && items.apikey != undefined) {
                        apiKey = items.apikey;
                        const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
                        const data = {
                            prompt: `Parse the question and suggest the prefect answer, ${JSON.stringify(parseData(dx))} in few words`,
                            max_tokens: 50,
                        };
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`,
                            },
                            body: JSON.stringify(data),
                        });
                    
                        if (response.ok) {
                            const result = await response.json();
                            const generatedText = result.choices[0].text;
                            ans.innerHTML = generatedText;
                        }else{
                            alert('FormGini: Invalid API Key or Balance Exhausted... please set new api key')
                        }
                    }else{
                        alert('FormGini: Please set your API Key...');
                    }
                });
            })
            $(d[i]).children("div").append(btn);
            $(d[i]).children("div").append(ans);
        }
    }

    function parseData(data) {
        const replaced = data.replace(/&quot;/gm, '"').replace('%.@.', '').replace(/,null/gm, '');
        var result = replaced.match(/(?<=(["']\b))(?:(?=(\\?))\2.)*?(?=\1)/gm);
        let l = [];
        result.map((d) => {
            l.push(d.replace('\\"'))
        })
        console.log(l)
        return replaced
    }

    addButtons()
})()