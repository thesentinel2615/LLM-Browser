import axios from 'axios';
const CURRENT_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const JS_API = `${CURRENT_URL}/api`;
const oai_defaults = {
    'max_tokens': 50,
    'temperature': 0.6,
}

function getSettings() {
    const settings = localStorage.getItem('generationSettings');
    if(settings){
        const parsedSettings = JSON.parse(settings);
        const customSettings = {
            'max_tokens': parsedSettings.max_length,
            'temperature': parsedSettings.temperature,
        }
        return customSettings;
    }
    return;
};

export async function characterTextGen(history, endpoint) {
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
    response = await axios.post(JS_API + `/completion`, { endpoint: endpoint, prompt: history, settings: customSettings});
    generatedText = response.data.results[0]; 
    return generatedText;
};