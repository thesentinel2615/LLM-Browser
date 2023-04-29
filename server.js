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
import Crawler from './src/assets/Crawler.js';

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

app.get('/crawl', async (req, res) => {
  const crawler = new Crawler();
  await crawler.init();
  await crawler.searchGoogle('bing');
  try {
    const elements = await crawler.crawl();
    const result = await crawler.formatElements(elements);
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
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
        temperature: settings.temperature,
        max_tokens: settings.max_tokens,
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