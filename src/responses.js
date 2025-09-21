const fs = require('fs');
const path = require('path');
const http = require('http');

const respondType = (message, isSuccess, statusCodeName, isXML) => {
  if (isXML) {
    let xml = `<response><message>${message}</message>`;
    if (!isSuccess) {
      xml += `<id>${statusCodeName}</id>`;
    }
    xml += '</response>';
    return xml;
  }
  const json = {
    message,
  };
  if (!isSuccess) {
    json.id = statusCodeName;
  }
  return JSON.stringify(json, null, 2);
};

const respond = (request, response, statusCode, message, isSuccess = true) => {
  const acceptHeader = request.headers.accept || 'application/json';
  const isXMLRequest = acceptHeader.includes('text/xml') && !acceptHeader.includes('*/*');

  const statusCodeName = http.STATUS_CODES[statusCode].replace(/\s/g, '');
  const content = respondType(message, isSuccess, statusCodeName, isXMLRequest);
  const contentType = isXMLRequest ? 'application/xml' : 'application/json';

  console.log(`Sending the response for ${request.url}`);
  console.log(`Raw Body Content: ${content}`);

  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });
  if (request.method !== 'HEAD') {
    response.write(content);
  }
  response.end();
};

// functions for the backslash cases
const getSuccess = (request, response) => {
  respond(request, response, 200, 'This is a successful response');
};

const getBadRequest = (request, response, query) => {
  if (query.get('valid') === 'true') {
    respond(request, response, 200, 'This request has the required parameters');
  } else {
    respond(request, response, 400, 'Missing valid query parameter set to true', false);
  }
};

const getUnauthorized = (request, response, query) => {
  if (query.get('loggedIn') === 'yes') {
    respond(request, response, 200, 'You have successfully viewed the content.');
  } else {
    respond(request, response, 401, 'Missing loggedIn query parameter set to yes', false);
  }
};

const getForbidden = (request, response) => {
  respond(request, response, 403, 'You do not have access to this content.', false);
};

const getInternal = (request, response) => {
  respond(request, response, 500, 'Internal Server Error. Something went wrong.', false);
};

const getNotImplemented = (request, response) => {
  respond(request, response, 501, 'A get request for this page has not been implemented yet. Check again later for updated content.', false);
};

const getNotFound = (request, response) => {
  respond(request, response, 404, 'The page you were looking for is not found.', false);
};

const getIndex = (request, response) => {
  const index = fs.readFileSync(path.join(__dirname, '/../client/client.html'));
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(index);
};

const getStyle = (request, response) => {
  const style = fs.readFileSync(path.join(__dirname, '/../client/style.css'));
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.end(style);
};

module.exports = {
  getSuccess,
  getBadRequest,
  getUnauthorized,
  getForbidden,
  getInternal,
  getNotImplemented,
  getNotFound,
  getIndex,
  getStyle,
};
