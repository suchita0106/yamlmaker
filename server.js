import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from 'dotenv';
dotenv.config();

const serverIp = process.env.SERVER_IP;
console.log(`Server IP: ${serverIp}`);

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const IP_ADDRESS = serverIp; // Replace with your machine's IP address
const PORT = 5001;

// Middleware
app.use(cors()); // Enable Cross-Origin Requests
app.use(bodyParser.json()); // Parse JSON request bodies


app.get("/get-config", (req, res) => {
    const filePath = path.join(__dirname, "public/config.yaml");
    try {
      const yamlContent = fs.readFileSync(filePath, "utf8");
      res.status(200).send(yamlContent);
    } catch (error) {
      console.error("Error reading YAML file:", error);
      res.status(500).send({ message: "Failed to read YAML file." });
    }
  });
  
// Endpoint to accept updated YAML
app.post("/deploy", (req, res) => {
  const { yamlContent } = req.body;

  if (!yamlContent) {
    return res.status(400).send({ message: "YAML content is missing." });
  }

  console.log("Received Updated YAML Content:");
  console.log(yamlContent);

  // Save YAML to a file
  const filePath = path.join(__dirname, "YML/updated-config.yaml");
  try {
    fs.mkdirSync(path.join(__dirname, "YML"), { recursive: true }); // Ensure directory exists
    fs.writeFileSync(filePath, yamlContent, "utf8");
    res.status(200).send({ message: "YAML file deployed successfully!" });
  } catch (error) {
    console.error("Error saving YAML file:", error);
    res.status(500).send({ message: "Failed to deploy YAML file." });
  }
});

// Start the server
app.listen(PORT, IP_ADDRESS, () => {
    console.log(`Server is running on http://${IP_ADDRESS}:${PORT}`);
  });