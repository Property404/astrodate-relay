"use strict";
const fs = require('fs');
const transapi = require('./transapi.js');
const crypto = require('crypto')
const server_constants = require('./server-constants.js');
const https = require("https");
const config = JSON.parse(fs.readFileSync(server_constants.CONFIGURATION_FILE))
const tls_private_key = fs.readFileSync(config.tls_key_file, "utf-8")
const tls_certificate = fs.readFileSync(config.tls_cert_file, "utf-8")
const cred =
	{
		key: tls_private_key,
		cert: tls_certificate,
		secureOptions: server_constants.TLS_OPTIONS,
	};
const express    = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const transactions = [];
app.post("/api/relay/push", function(req, res)
{
	transactions.push(req.body);
	console.log("Added transactions: ", req.body);
	res.send({"status":"success"});
});

app.get("/api/relay/poll", function(req, res)
{
	const since = Number(req.body.since);
	if(since === undefined || since === null||
		typeof since !== "number"
	)
		res.send({"error":"bad 'since' val"});
	res.send({
		"since": transactions.length,
		"transactions": transactions.slice(since)
	});
});

app.post("/api/bouncer/create_user", function(req, res)
{
	const public_key = req.body.public_key;
	const email = req.body.email;
	
	if(config.bouncer)
	{
		crypto.randomBytes(16, (err, buf)=>
			{
				const id = buf.toString('hex');
				transapi.makeTransaction({
					"type": 'new_pubkey',
					"version": server_constants.ASTRODATE_PROTOCOL_VERSION,
					"for": id,
					"content": public_key
				}, config.bouncer.private_key).then(data=>
					{
						console.log(data);
						res.send(data);
					})
			});
	}
	else
	{
		res.send("Fuck");
	}
});

https.createServer(cred, app).listen(server_constants.PORT);
console.log("Starting server on port "+server_constants.PORT);
