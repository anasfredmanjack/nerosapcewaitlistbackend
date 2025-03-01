//require express
const express  = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose'); //require mongoose for db connection
const WaitlistDetails = require('./models/waitlist'); //import db schema wrapped by models
const cors  = require('cors');
require('dotenv').config();


//invoke express server
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes

//Middleware to parse JSON data
app.use(express.json());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Replace with your email service provider
    auth: {
      user: process.env.EMAIL,
        pass: process.env.PASSWORD, // App password or real password
    },
  });



//Mongodb connection uri
const dbURI = process.env.DBURI;
mongoose.connect(dbURI)
.then((result)=>  {
    console.log('connected to db');
    app.listen(PORT, ()=> console.log('Server running on port 5000')); //connect to db and start server after connection
})
.catch((error) => console.log('error connecting to db', error));


//log requests made
app.use((req,res, next) => {
    console.log('request was made', req.hostname);
    console.log('request was made', req.url);
    console.log('request was made', req.path);
    console.log('request was made', req.method);
    next();
});

//listen for get requests on route
app.post('/api/submit', async(req,res) => {
    try{
        const { name, email } = req.body;

        //check input fields
        if(!name || !email) {
            return res.status(404).json({message: 'Your name and Email are required'});
        }

        const waitlist = new WaitlistDetails({name, email});
        await waitlist.save();

        //dynamic mail body
        const emailBody =`
        <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Nerospace</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  color: #333;
              }
              .highlight {
                  color: #6a0dad;
                  font-weight: bold;
              }
              .button {
                  display: block;
                  width: 200px;
                  text-align: center;
                  background-color: #6a0dad;
                  color: #fff;
                  padding: 12px;
                  margin: 20px auto;
                  border-radius: 5px;
                  text-decoration: none;
                  font-weight: bold;
              }
              .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #777;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2 class="header">You're In! 🎉</h2>
              <p>Hey <span class="highlight">${name}</span>,</p>
              <p>Welcome to <span class="highlight">Nerospace</span> – the world’s decentralized talent marketplace where skills meet opportunity.</p>
              <p>You’ve secured your place in the future of freelancing, where you can sell your **gigs, talents, and digital items**, all powered by **Web3 technology and NeroCoin**.</p>
              <a href="https://nerospace-one.vercel.app/" class="button">Invite Your Friends</a>
              <p>We’ll be in touch soon with exclusive updates. Stay tuned!</p>
              <div class="footer">&copy; 2025 Nerospace | All Rights Reserved</div>
          </div>
      </body>
      </html>`;


        try {
            // Send email
            await transporter.sendMail({
              from: `"NeroSpace" <${process.env.RECEIVER_EMAIL}>`,
              to: email, // Recipient email
              subject: 'Nerospace waitlist',
              html: emailBody,
            });
            console.log('data saved to db');
            res.status(200).json({ message: 'Email sent!' });
          } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Failed to send checkout details.' });
          }
        
 } catch (error) {
    console.error('Error saving to DB:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
 }
    
   

});

