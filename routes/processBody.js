const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.text());

router.post('/', function(req, res, next) {
//		const bodyContent = req.body;
//		res.send("Hi A: " + bodyContent.length);
	
  // Add your server-side processing code here
  // The body content will be available in the `req.body` object
  // You can use any server-side language or framework to perform the processing
//	console.log(`Incoming ${req.method} request: ${req.body}`);
	const { spawn } = require('child_process');

//	router.post('/', function(req, res, next) {
		const bodyContent = req.body;
//		res.send("Hi B" + bodyContent);
		const pythonProcess = spawn('python', ['Index-Validation.py', bodyContent]);

		let output = '';
		pythonProcess.stdout.on('data', (data) => {
			output += data;
		});
		pythonProcess.stderr.on('data', (data) => {
			output += data;
		});

		console.log(`Output... ${req.method} request: ${output}`);

		pythonProcess.on('exit', (code) => {
			if (code === 0) {
				res.send(output);
//				res.send("AAA");
			} else {
				res.status(500).send(output);
//				res.status(500).send("BBB");
			}
		});

});

module.exports = router;
