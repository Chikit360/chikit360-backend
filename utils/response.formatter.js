const sendResponse = (
  res,
  { data = null, status = 200, message = 'Success', error = false } = {}
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Adjust the error for production if it's a server-side error
  const formattedError = isProduction && status >= 500 ? 'Internal Server Error' : message;

  // Standard Response
  if (data && data.errorResponse) {
    const code = data.errorResponse.code
    if (code === 11000) {
      const duplicateField = Object.keys(data.errorResponse.keyValue).join(',');
      message = `Duplicate entry of ${duplicateField}`
    }
  }
  return res.status(status).json({
    success: status >= 200 && status < 300,
    status,
    message,
    data,
    error
  });
};

module.exports = sendResponse;
