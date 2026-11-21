class ApiResponse {
  static ok(data, message = 'Operation successful') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message, data = null) {
    return {
      success: false,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ApiResponse;

