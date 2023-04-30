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
    let settings = await getSettings();
    let genSettings = oai_defaults;
    let response;
    let generatedText;
    switch(command.toLowerCase()){
        case 'objective':
            let prompt;
            let browser = await axios.post(`/py/crawl`);
            let objective = arg;
            let url = await axios.get(`/py/currentpage`);
            let previousCommand = 'N/A';
            let imageData = await axios.get(`/py/screenshot`);
            if(browser.data !== null){
                prompt = await fillPrompt(browser.data, objective, url.data, previousCommand);
                response = await axios.post(`/api/completion`, { endpoint: settings.api_key, prompt: prompt, settings: genSettings});
                generatedText = response.data.results[0];
                let commandData = {
                    'text': generatedText,
                    'image': imageData.data.image,
                }
                localStorage.setItem('previousCommand', generatedText);
                return commandData;
            }else{
                console.log('Error');
            }
            break;
        case 'confirm':
            let currentCom = localStorage.getItem('previousCommand');
    }

}