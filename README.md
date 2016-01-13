# Port Proxy
A simple node program that allows you to host multiple webservers on a single machine on the same port.

## Features
- Allows you to run multiple webservers on the same port (with different domain/subdomain for each one)
- HTTPS support
- Easy to configure and use

## Installation
Clone the repository, then
```sh
$ npm install
$ npm start
```

## Configuration
```js
{
	"httpPort": 9000, // Port to run the HTTP proxy server on
	"httpsPort": 9001, // Port to run the HTTPS proxy server on
	"proxies": [{
		"from": "http://subdomain.example.com", // What the user types into the browser
		"target": "http://localhost:8080" // What you send to the sure
	}, {
		"from": "https://secure.example.com", // What the user types in the browser
		"target": "http://localhost:8080", // What you send to the user
		"https": {
			"key": "path/to/key", // SSL key for secure.example.com
			"cert": "path/to/cert" // SSL cert for secure.example.com
		}
	}],
	"notFoundMessage": "404 not found", // 404 error
	"errorMessage": "An error occurred, please try again" // proxy error
}
```
