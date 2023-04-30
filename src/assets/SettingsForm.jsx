import React, { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { defaultPrompt } from './Constants';

const SettingsForm = () => {
    const [basePrompt, setBasePrompt] = useState('');
    const [fullAutoMode, setFullAutoMode] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [maxLength, setMaxLength] = useState(50);
    const [temperature, setTemperature] = useState(0.6);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        fetchBrowserSettings();
    }, []);

    const fetchBrowserSettings = () => {
        fetch('/api/fetchsettings')
        .then((res) => res.json())
        .then((data) => {
            setBasePrompt(data.basePrompt || defaultPrompt);
            setFullAutoMode(data.fullAutoMode || false);
            setMaxLength(data.maxLength || 50);
            setTemperature(data.temperature || 0.6);
            setApiKey(data.apiKey || '');
        })
        .catch((error) => {
        console.error('Error fetching settings:', error);
        });
    };
      
    const saveBrowserSettings = () => {
        fetch('/api/savesettings', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            basePrompt,
            fullAutoMode,
            maxLength,
            temperature,
            apiKey,
            }),
        })
        .then((res) => res.json())
        .then((data) => {
        console.log(data);
        })
        .catch((error) => {
        console.error('Error saving settings:', error);
        });
    };

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
    <div className="flex items-center justify-center w-full">
        <div className="bg-green-800 p-4 rounded-lg shadow-md w-1/2 border-2 border-solid border-emerald-500">
            <div
            className="cursor-pointer flex items-center justify-between text-2xl font-bold"
            onClick={toggleAccordion}
            >
            <span className="text-2xl font-bold mb-2 text-center items-center">LLM Browser Settings</span>
            <span className="text-2xl font-bold mb-2 text-center items-center">{isOpen ? '-' : '+'}</span>
            </div>
            { isOpen && (
            <div>
                    <div
                    className="cursor-pointer flex items-center justify-between text-2xl font-bold"
                    onClick={() => setShowPrompt(!showPrompt)}
                    >
                    <h1 className="text-2xl font-bold mb-4 text-center items-center">Base Prompt:</h1>
                    <span className="text-2xl font-bold mb-4 text-center items-center">{showPrompt ? '-' : '+'}</span>
                    </div>
                    { showPrompt && (
                        <div>
                            <TextareaAutosize
                            id="basePrompt"
                            value={basePrompt}
                            onChange={(e) => {setBasePrompt(e.target.value); saveBrowserSettings();}}
                            className="mt-1 block w-full border border-emerald-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button 
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-emerald bg-emerald-600 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setBasePrompt(defaultPrompt)}>
                            Reset to Default Prompt
                            </button>
                        </div>
                    )}
                {/* <div className="flex items-center">
                    <input
                    type="checkbox"
                    id="fullAutoMode"
                    checked={fullAutoMode}
                    onChange={(e) => {setFullAutoMode(e.target.checked); saveBrowserSettings();}}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-emerald-300 rounded"
                    />
                    <label htmlFor="fullAutoMode" className="ml-2 text-xl">
                    Full Auto Mode
                    </label>
                </div> */}
                <div className="flex flex-col items-center">
                    <label htmlFor="apiKey" className="text-xl font-medium">API Key:</label>
                    <input
                    type="text"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => {setApiKey(e.target.value); saveBrowserSettings();}}
                    className="mt-1 block w-full border border-emerald-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <h1 className="block text-xl font-medium">Generation Settings:</h1>
                <div className="grid grid-cols-3 gap-4">
                    <span className="col-span-1 font-bold">Temperature</span>
                    <input className="col-span-1" type="range" min='0' max='1' step='0.01' value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                    <input className="col-span-1 character-field" id='input-container' type="number" min='0' max='1' step='0.01' value={temperature} onChange={(e) => {setTemperature(e.target.value); saveBrowserSettings();}} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="col-span-1 font-bold">Max Generation Length</span>
                    <input className="col-span-1" type="range" min='1' max='512' value={maxLength} onChange={(e) => setMaxLength(e.target.value)} />
                    <input className="col-span-1 character-field" id='character-field' type="number" min='1' max='512' value={maxLength} onChange={(e) => {setMaxLength(e.target.value); saveBrowserSettings();}} />
                </div>
                <button
                    onClick={() => saveBrowserSettings()}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-emerald bg-emerald-600 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Settings
                </button>
            </div>
            )}
        </div>
    </div>
    );
};

export default SettingsForm;
