const errorCodes = {
	INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
	UNAUTHORIZED: "UNAUTHORIZED",
};
  
function sendError(code, errorStr, err) {
	return {
		code: code || 500,
		data: error(errorStr, err),
	};
}
  
const sendSuccess = response => {
	const responseData = { success: true, ...response };
	return {
		code: 200,
		data: responseData,
	};
};
  
function error(errorStr, err) {
	return {
		success: false,
		error: errorStr || errorCodes.INTERNAL_SERVER_ERROR,
		message: err ? err.toString() : undefined,
	};
}
  
module.exports = {
	error,
	errorCodes,
	sendError,
	sendSuccess
};
  