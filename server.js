import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import { Configuration, OpenAIApi } from "openai";
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
});

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: storage });

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    app.get('/', async (req, res) => {
      const viteServer = await createServer();
      const url = viteServer.url;
  
      res.redirect(url);
    });
  }
  
let up = 'uploads/';

// Check if the directory exists
if (!fs.existsSync(up)) {
    // Create the directory
    fs.mkdirSync(up);
}

// Signal handling
process.on('SIGINT', () => {
    console.log('Closing server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
});
  
process.on('SIGTERM', () => {
    console.log('Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/savesettings', (req, res) => {
  const settings = req.body;

  fs.writeFile('settings.json', JSON.stringify(settings, null, 2), (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save settings' });
    } else {
      res.status(200).json({ message: 'Settings saved successfully' });
    }
  });
});

app.get('/fetchsettings', (req, res) => {
  fs.readFile('settings.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch settings' });
    } else {
      res.status(200).json(JSON.parse(data));
    }
  });
});

app.post('/completion', async (req, res) => {
  try {
    let { endpoint, prompt, settings } = req.body;
    let response;
    // Create a configuration object with your key
    const configuration = new Configuration({
      apiKey: endpoint,
    });
    // Create an openaiApi object with your configuration and headers
    const openaiApi = new OpenAIApi(configuration);
    try{
      response = await openaiApi.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: parseFloat(settings.temperature),
        max_tokens: parseInt(settings.max_tokens),
      });
      res.json({ results: [response.data.choices[0].text]})
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

app.post('/summarize', async (req, res) => {
  let { url } = req.body
  try {
    // check if url is provided and valid
    if (!url || !url.startsWith('http')) {
      throw new Error('No valid url provided');
    }
    const content = await getContentFromGoogleResults(url);
    // check if content is empty
    if (!content) {
      throw new Error('No content found');
    }
    res.json({ content: content})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

async function getMainContent(url) {
  let content;
  const response = await axios.get(url);
  const dom = new JSDOM(response.data, { url });
  const document = dom.window.document;
  // use readability.js to parse the document
  const reader = new Readability(document);
  const article = reader.parse();

  // check if article exists
  if (!article.title || !article.content) {
    const main = document.querySelector('main') || document.querySelector('article') || document.querySelector('body');
    
    const scripts = main.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    content = main.textContent.trim();
  }else{
    content = article.title + "\n" + article.content.textContent;
  }
  return content;
}

async function getGoogleSearchResults(query) {
  const response = await axios.get('https://www.google.com/search', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36'
    },
    params: {
      q: query
    }
  });
  const dom = new JSDOM(response.data);
  const document = dom.window.document;
  const searchResults = Array.from(document.querySelectorAll('.tF2Cxc'));

  // Get up to three result URLs
  const resultUrls = searchResults.slice(0, Math.min(3, searchResults.length)).map(result => {
    const linkElement = result.querySelector('a');
    if (linkElement) {
      return linkElement.href;
    }
  }).filter(url => url);

  return resultUrls;
}

// your existing code
async function getContentFromGoogleResults(url) {
  let resultUrls = [];
  if(url.startsWith('https://www.google.com/search')) {
    const query = getQueryFromGoogleSearchUrl(url);
    resultUrls = await getGoogleSearchResults(query);
  }else{
    resultUrls.push(url);
  }
  
  // use Promise.allSettled to handle any rejected promises
  const contentPromises = resultUrls.map(url => {
    // log the url
    console.log('Getting content from', url);
    return getMainContent(url);
  });
  const contentList = await Promise.allSettled(contentPromises);

  // filter out any failed promises and join the fulfilled values
  const combinedContent = contentList.filter(promise => promise.status === 'fulfilled').map(promise => {
    // log the value
    console.log('Got content:', promise.value);
    return promise.value;
  }).join('\n\n');

  return combinedContent;
}

function getQueryFromGoogleSearchUrl(url) {
  const googleSearchUrl = new URL(url);
  if (googleSearchUrl.hostname !== 'www.google.com' || googleSearchUrl.pathname !== '/search') {
    throw new Error('Invalid Google search URL');
  }
  const query = googleSearchUrl.searchParams.get('q');
  return query;
}