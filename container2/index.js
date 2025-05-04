const express = require('express');
const bodyParser = require('body-parser');
const { Translate } = require('@google-cloud/translate').v2;
const mysql = require('mysql2');
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
require('dotenv').config({path:'../.env'}); // Load environment variables

const app = express();
const port = 3001;

// Set up Google Cloud Translation client
const translate = new Translate({
  key: process.env.GOOGLE_CLOUD_API_KEY, 
});

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
});

// debug region value
console.log('AWS Region:', process.env.AWS_REGION);

// AWS SDK v3 Configuration
const sqs = new SQSClient({
  region: process.env.AWS_REGION
});

// Poll the SQS queue for new messages
async function pollSQS() {
  const params = {
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    WaitTimeSeconds: 5,  // Enable long polling
  };

  try {
    const data = await sqs.send(new ReceiveMessageCommand(params));

    if (data.Messages) {
      const message = data.Messages[0];
      const id = JSON.parse(message.Body).id;

      // Process the translation based on the ID received from SQS
      db.query('SELECT originalText FROM translations WHERE id = ?', [id], async (err, result) => {
        if (err) throw err;

        if (result.length === 0) {
          console.log('Text not found');
          return;
        }

        const originalText = result[0].originalText;

        // Translate the text
        const [detection] = await translate.detect(originalText);
        const targetLanguage = detection.language === 'en' ? 'fr' : 'en'; // Toggle between French and English
        const [translation] = await translate.translate(originalText, targetLanguage);

        // Update the database with the translated text
        const updateQuery = 'UPDATE translations SET translatedText = ?, status = ? WHERE id = ?';
        db.query(updateQuery, [translation, 'completed', id], (err, result) => {
          if (err) throw err;
          console.log('Translation completed and database updated');

          // Delete the processed message from the queue
          const deleteParams = {
            QueueUrl: process.env.AWS_SQS_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          };

          sqs.send(new DeleteMessageCommand(deleteParams))
            .then(() => {
              console.log('Message deleted from SQS');
            })
            .catch(err => {
              console.log('Error deleting message from SQS:', err);
            });
        });
      });
    }
  } catch (err) {
    console.log('Error receiving message from SQS:', err);
  }
}

setInterval(pollSQS, 6000);