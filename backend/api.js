require('dotenv').config();
const { log } = require("console");
const http = require("http");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { resourceLimits } = require('worker_threads');
 
const host = 'localhost';
const port = 8000;

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });


const requestListener = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === 'OPTIONS') {
        res.writeHead(204); 
        res.end();
        return;
    }
    
    let data = '';
    let api_url = '';
    req.on('data', chunk => {
      data += chunk;
    })
    req.on('end', async () => {
      api_url = JSON.parse(data).api_url 
      res.setHeader("Content-Type", "application/json");
      data = await fetchPokemonApi(api_url);
      if(JSON.stringify(data) == "{}") {
        res.end("Nome do pokemon inválido.");
        return;
      }
      aiResponse = await fetchGeminiAi("Fale curiosidades sobre o seguinte pokemon a partir de algumas características suas: " + "name: " + data.name + " id: " 
        + data.id + " weight: " + data.weight + " Escreva em parágrafos, não use bullet points.");
      if(aiResponse == "") {
        res.end("Erro na obtenção da resposta da IA. Por favor tente novamente.")
        return;
      }
      res.writeHead(200);
      res.end(aiResponse); 
    })
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

const fetchPokemonApi = async url => {
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error("Pokemon does not exist");
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

const fetchGeminiAi = async prompt => {
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.log(error);
        return "";
    }
}

