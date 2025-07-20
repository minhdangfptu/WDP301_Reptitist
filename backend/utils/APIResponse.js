function successResponse(data, statusCode) {
  return {
    message: "ok",
    code: statusCode || 200,
    data: data
  };
}
function internalErrorResponse(error) {
  return {
    message: "ok",
    code: 500,
    error: error
  };
}

module.exports = { successResponse };