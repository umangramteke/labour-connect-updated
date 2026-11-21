const ApiResponse = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json(ApiResponse.error(message, null));
}

module.exports = errorHandler;

