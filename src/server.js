const http = require('http');
const responsesHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': responsesHandler.getIndex,
  '/style.css': responsesHandler.getStyle,
  '/success': responsesHandler.getSuccess,
  '/badRequest': responsesHandler.getBadRequest,
  '/unauthorized': responsesHandler.getUnauthorized,
  '/forbidden': responsesHandler.getForbidden,
  '/internal': responsesHandler.getInternal,
  '/notImplemented': responsesHandler.getNotImplemented,

};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  request.acceptedTypes = (request.headers.accept || '').split(',');
  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response, parsedUrl.searchParams);
  } else {
    responsesHandler.getNotFound(request, response);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.01: ${port}`);
});
