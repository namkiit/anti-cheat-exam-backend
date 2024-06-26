exports.handleError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    status: "error",
    message
  });
};

exports.handleSuccess = (res, data, message = "Success") => {
  return res.status(200).json({
    status: "success",
    message,
    data
  });
};
