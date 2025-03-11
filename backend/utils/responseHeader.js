class ResponseHandler {
    success(res, message, data = null) {
      res.status(200).json({ success: true, message, data });
    }
  
    error(res, message, statusCode = 500) {
      res.status(statusCode).json({ success: false, message });
    }
  }
  
  module.exports = new ResponseHandler();
  