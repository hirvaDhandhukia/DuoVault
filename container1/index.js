const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const AWS = require('@aws-sdk/client-sqs');  
const cors = require('cors');
require('dotenv').config({path:'../.env'}); // Load environment variables

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const port = 3000;

console.log(process.env.DB_HOST)
// MySQL Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
  const createQuery = `CREATE TABLE IF NOT EXISTS translations (
                          id INT AUTO_INCREMENT PRIMARY KEY,
                          originalText VARCHAR(255) NOT NULL,
                          translatedText VARCHAR(255) NOT NULL,
                          status VARCHAR(50) NOT NULL
                      );`
  db.query(createQuery, ()=>{
    console.log("table created successfully");
  });
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// app.options('*', cors());

// AWS SDK - SQS Client Setup
const sqs = new AWS.SQSClient({
  region: process.env.AWS_REGION
});
console.log('AWS Region:', process.env.AWS_REGION);

// Endpoint 1: Save text into MySQL database and put the id in SQS queue
app.post('/process', async (req, res) => {
  const { text } = req.body;

  // Check if the originalText or translatedText already exists in the database
  const checkQuery = 'SELECT * FROM translations WHERE originalText = ? OR translatedText = ?';
  db.query(checkQuery, [text, text], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // If text already exists, send a message with the existing data
      res.json({
        message: 'Text already exists in the database',
        id: result[0].id,
      });
      return;
    }

    // If text does not exist, insert it into the database with status as pending
    const insertQuery = 'INSERT INTO translations (originalText, translatedText, status) VALUES (?, ?, ?)';
    db.query(insertQuery, [text, '', 'pending'], (err, result) => {
      if (err) throw err;

      const id = result.insertId; // Get the ID of the inserted row

      // Send the id to SQS queue for Container 2 to process
      const sqsParams = {
        MessageBody: JSON.stringify({ id: id }), // Send the ID in the message
        QueueUrl: process.env.AWS_SQS_QUEUE_URL, 
      };

      sqs.send(new AWS.SendMessageCommand(sqsParams))
        .then(() => {
          console.log(`ID: ${id} added to SQS queue for processing.`);
          res.json({ message: 'Text saved', id: id });
        })
        .catch(err => {
          console.log('Error sending message to SQS:', err);
          res.json({ message: 'Error processing, please try again!', id: undefined });
        });

      
    });
  });
});

// Endpoint 2: Get translation status and translated text
app.post('/get-translation', (req, res) => {
  const { id } = req.body;

  // Fetch the translation status from MySQL
  db.query('SELECT originalText, translatedText, status FROM translations WHERE id = ?', [id], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      res.status(404).json({ message: 'Text not found' });
      return;
    }

    const { originalText, translatedText, status } = result[0];

    if (status === 'pending') {
      res.status(503).json({ message: 'Translation is still pending', status });
      return;
    }

    // If the status is completed, return the translated text
    res.json({ originalText, translatedText, status });
  });
});

app.listen(port, () => {
  console.log(`Container 1 listening at http://localhost:${port}`);
});
