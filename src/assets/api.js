import axios from 'axios';
const CURRENT_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const JS_API = `${CURRENT_URL}/api`;
const oai_defaults = {
    'max_tokens': 50,
    'temperature': 0.6,
}

function getSettings() {
    let otherSettings = null;
    fetch('/api/fetchsettings')
    .then((res) => res.json())
    .then((data) => {
        otherSettings = data;
    })
    .catch((error) => {
    console.error('Error fetching settings:', error);
    });
    if(otherSettings){
        const customSettings = {
            'max_tokens': otherSettings.maxLength,
            'temperature': otherSettings.temperature,
            'base_prompt': otherSettings.basePrompt,
            'browser': otherSettings.browser,
            'api_key': otherSettings.apiKey,
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
    response = await axios.post(JS_API + `/completion`, { endpoint: customSettings.api_key, prompt: createdPrompt, settings: customSettings});
    generatedText = response.data.results[0]; 
    return generatedText;
};