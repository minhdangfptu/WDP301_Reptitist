function successResponse(data) {
  return {
    message: "ok",
    code: 200,
    data: data
  };
}

module.exports = { successResponse };
