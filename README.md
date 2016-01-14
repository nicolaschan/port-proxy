# Port Proxy
A simple node program that allows you to host multiple web servers on a single computer on the same port.

## Features
- Allows you to run multiple webservers on the same port (with different domain/subdomain for each one)
- HTTPS support
- Easy to configure and use

## Installation
Clone the repository, configure, then
```sh
$ npm install
$ npm start
```

## Configuration
```js
{
	"http port": 9000, // Port to run the HTTP server on
	"https port": 9001, // Port to run the HTTPS server on
	"proxies": [{
		"from": "http://subdomain.example.com", // What the user requests
		"target": "http://localhost:8080" // What you send the user
	}, {
		"from": "https://secure.example.com", // What the user requests
		"target": "http://localhost:8080", // What you send the user
		"https": {
			"key": "path/to/key", // SSL private key for secure.example.com
			"cert": "path/to/cert" // SSL certificate for secure.example.com
		}
	}],
	"error messages": {
		"not found": "404 not found", // No matching subdomain/domain is listed above
		"proxy error": "An error occurred, please try again" // Error with the proxy
	}
}
```
