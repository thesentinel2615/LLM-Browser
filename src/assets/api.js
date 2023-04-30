import axios from 'axios';
const CURRENT_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

const JS_API = `${CURRENT_URL}/api`;
const oai_defaults = {
    'max_tokens': 50,
    'temperature': 0.6,
}

async function getSettings() {
    let otherSettings = await axios.get(`/api/fetchsettings`);
    if(otherSettings){
        const customSettings = {
            'max_tokens': otherSettings.data.maxLength,
            'temperature': otherSettings.data.temperature,
            'base_prompt': otherSettings.data.basePrompt,
            'api_key': otherSettings.data.apiKey,
        }
        return customSettings;
    }
    return;
};

export async function characterTextGen(text) {
    let response;
    let generatedText;
    let customSettings = null;
    if(localStorage.getItem('generationSettings') !== null){
        customSettings = getSettings();
        console.log(customSettings);
    }
    else{
        customSettings = oai_defaults;
    }
    let createdPrompt = customSettings.base_prompt;
    response = await axios.post(`/api/completion`, { endpoint: customSettings.api_key, prompt: createdPrompt, settings: customSettings});
    generatedText = response.data.results[0]; 
    return generatedText;
};

export async function fillPrompt(browser, objective, url, previousCommand) {
    let settings = await getSettings();
    let prompt = settings.base_prompt;
    prompt = prompt.replace('$url', url);
    prompt = prompt.replace('$browser_content', browser);
    prompt = prompt.replace('$objective', objective);
    prompt = prompt.replace('$previous_command', previousCommand);
    return prompt;
}
export async function handleCrawlerCommand(command, arg) {
    switch(command.toLowerCase()){
        case 'objective':
            localStorage.setItem('isDone', 'false');
            await axios.post('/py/page', {
            url: 'https://www.google.com',
            });
            return await getNewObjective(arg);
        case 'confirm':
            let currentCom = localStorage.getItem('previousCommand');
            let objective = localStorage.getItem('objective');
            if (currentCom.startsWith("SCROLL UP")) {
                await axios.post(`/py/scroll/${'up'}`);
            } else if (currentCom.startsWith("SCROLL DOWN")) {
                await axios.post(`/py/scroll/${'down'}`);
            } else if (currentCom.startsWith("DONE")) {
                localStorage.setItem('isDone', 'true');
            } else if (currentCom.startsWith("CLICK")) {
                console.log(currentCom);
                let commasplit = currentCom.split(",");
                console.log(commasplit)
                let id = commasplit[0].split(" ")[1];
                console.log(id)
                await axios.post(`/py/click/${id}`);
            } else if (currentCom.startsWith("GOOGLE")) {
                let spacesplit = currentCom.split(" ");
                let query = spacesplit.slice(1).join(" ");
                await axios.post(`/py/search/${query}`);
            } else if (currentCom.startsWith("TYPE")) {
                let spacesplit = currentCom.split(" ");
                let id = spacesplit[1];
                let text = spacesplit.slice(2).join(" ");
                // Strip leading and trailing double quotes
                text = text.substring(1, text.length - 1);
            
                if (currentCom.startsWith("TYPESUBMIT")) {
                    text += '\n';
                }
                await axios.post(`/py/type/${id}/${text}`);
            }
            return await getNewObjective(objective);
    }

}
async function getNewObjective(arg) {
    let settings = await getSettings();
    let response;
    let generatedText;
    let prompt;
    let previousCommand;
    let browser = await axios.post(`/py/crawl`);
    let objective = arg;
    let url = await axios.get(`/py/currentpage`);
    if(localStorage.getItem('previousCommand') !== null){
        previousCommand = localStorage.getItem('previousCommand');
    }else{
        previousCommand = 'N/A';
    }
    let imageData = await axios.get(`/py/screenshot`);
    if(browser.data !== null){
        prompt = await fillPrompt(browser.data, objective, url.data, previousCommand);
        response = await axios.post(`/api/completion`, { endpoint: settings.api_key, prompt: prompt, settings: settings});
        generatedText = response.data.results[0];
        let commandData = {
            'text': generatedText,
            'image': imageData.data.image,
        }
        localStorage.setItem('objective', objective);
        localStorage.setItem('previousCommand', generatedText);
        return commandData;
    }else{
        console.log('Error');
    }
}