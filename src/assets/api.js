import axios from 'axios';
const CURRENT_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

const JS_API = `${CURRENT_URL}/api`;
const oai_defaults = {
    'max_tokens': 50,
    'temperature': 0.5,
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

export async function fillPrompt(browser, objective, url, previousCommand, userSuggestion) {
    let settings = await getSettings();
    let prompt = settings.base_prompt;
    prompt = prompt.replace('$url', url);
    prompt = prompt.replace('$browser_content', browser);
    prompt = prompt.replace('$objective', objective);
    prompt = prompt.replace('$previous_command', previousCommand);
    if(userSuggestion !== null){
    prompt = prompt.replace('$user_suggestion', userSuggestion);
    }
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
                let commasplit = currentCom.split(",");
                let id = commasplit[0].split(" ")[1];
                await axios.post(`/py/click/${id}`);
            } else if (currentCom.startsWith("SUMMARIZE")){
                let pageData = await axios.get(`/py/summarize`);
                let summary = pageData.data;
                console.log(summary);
            }else if (currentCom.startsWith("GOOGLE")) {
                let spacesplit = currentCom.split(" ");
                let query = spacesplit.slice(1).join(" ");
                await axios.post(`/py/search/${query}`);
            } else if (currentCom.startsWith("TYPE")) {
                let spacesplit = currentCom.split(" ");
                let id = spacesplit[1];
                let text = spacesplit.slice(2).join(" ");
                // Strip leading and trailing double quotes
                text = text.substring(1, text.length - 1);
                await axios.post(`/py/type/${id}/${text}`);
                if (currentCom.startsWith("TYPESUBMIT")) {
                    text += '\n';
                    await axios.post(`/py/enter`);
                }

            }
            return await getNewObjective(objective);
        case 'suggest':
            let userSuggestion = arg;
            let currentObjective = localStorage.getItem('objective');
            return await getNewObjective(currentObjective, userSuggestion);
    }

}
async function getNewObjective(arg, userSuggestion) {
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
        prompt = await fillPrompt(browser.data, objective, (url.data).slice(0, 100), previousCommand, userSuggestion);
        response = await axios.post(`/api/completion`, { endpoint: settings.api_key, prompt: prompt, settings: settings});
        generatedText = response.data.results[0];
        let commandData = {
            'text': generatedText,
            'image': imageData.data.image,
            'url': url.data,
        }
        localStorage.setItem('objective', objective);
        localStorage.setItem('previousCommand', generatedText);
        return commandData;
    }else{
        console.log('Error');
    }
}