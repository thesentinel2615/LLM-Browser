import React, { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { defaultPrompt } from './Constants';

const SettingsForm = () => {
    const [basePrompt, setBasePrompt] = useState('');
    const [fullAutoMode, setFullAutoMode] = useState(false);
    const [browser, setBrowser] = useState('Chrome');
    const [isOpen, setIsOpen] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [maxLength, setMaxLength] = useState(50);
    const [temperature, setTemperature] = useState(0.6);

    useEffect(() => {
        fetchBrowserSettings();
    }, []);

    const fetchBrowserSettings = () => {
        fetch('/api/fetchsettings')
        .then((res) => res.json())
        .then((data) => {
            setBasePrompt(data.basePrompt || defaultPrompt);
            setFullAutoMode(data.fullAutoMode || false);
            setBrowser(data.browser || 'Chrome');
            setMaxLength(data.maxLength || 50);
            setTemperature(data.temperature || 0.6);
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
            browser,
            maxLength,
            temperature,
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
        <div className="bg-orange-800 p-4 rounded-lg shadow-md w-1/2 border-2 border-solid border-gray-500">
            <div
            className="cursor-pointer flex items-center justify-between text-2xl font-bold"
            onClick={toggleAccordion}
            >
            <span className="text-2xl font-bold mb-2 text-center items-center">LLM Browser Settings</span>
            <span className="text-2xl font-bold mb-2 text-center items-center">{isOpen ? '-' : '+'}</span>
            </div>
            { isOpen && (
                <form onSubmit={saveBrowserSettings} className="space-y-4">
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
                            onChange={(e) => setBasePrompt(e.target.value)}
                            className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    )}
    
                <div className="flex items-center">
                    <input
                    type="checkbox"
                    id="fullAutoMode"
                    checked={fullAutoMode}
                    onChange={(e) => setFullAutoMode(e.target.checked)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="fullAutoMode" className="ml-2 text-xl">
                    Full Auto Mode
                    </label>
                </div>
    
                <div>
                    <label htmlFor="browser" className="block text-xl font-medium">
                    Browser:
                    </label>
                    <br />
                    <select
                    id="browser"
                    value={browser}
                    onChange={(e) => setBrowser(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                    <option value="Chrome">Chrome</option>
                    <option value="Firefox">Firefox</option>
                    <option value="Edge">Edge</option>
                    </select>
                </div>
                <h1 className="block text-xl font-medium">Generation Settings:</h1>
                <div className="grid grid-cols-3 gap-4">
                    <span className="col-span-1 font-bold">Temperature</span>
                    <input className="col-span-1" type="range" min='0' max='1' step='0.01' value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                    <input className="col-span-1 character-field" id='input-container' type="number" min='0' max='1' step='0.01' value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="col-span-1 font-bold">Max Generation Length</span>
                    <input className="col-span-1" type="range" min='1' max='512' value={maxLength} onChange={(e) => setMaxLength(e.target.value)} />
                    <input className="col-span-1 character-field" id='character-field' type="number" min='1' max='512' value={maxLength} onChange={(e) => setMaxLength(e.target.value)} />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Settings
                </button>
                </form>
            )}
        </div>
    </div>
    );
};

export default SettingsForm;
