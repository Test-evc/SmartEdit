const express = require('express');
const processBodyRouter = require('./routes/processBody');

const app = express();

const port = process.env.PORT || 4000;

//app.use(express.bodyParser.text());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for all routes

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );
  next();
});

app.get('/process-body', (req, res) => {
  res.send('Received GET request to /process-body');
});

app.use('/process-body', processBodyRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // Log incoming requests to the console
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

});