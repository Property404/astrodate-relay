const node_constants = require('constants');

module.exports = {
	CONFIGURATION_FILE: "config.json",
	ASTRODATE_PROTOCOL_VERSION: "1",
	PORT: "3141",

	// Use TLS 1.2 and 1.3 only
	TLS_OPTIONS :
		node_constants.SSL_OP_NO_TLSv1 |
		node_constants.SSL_OP_NO_TLSv1_0|
		node_constants.SSL_OP_NO_TLSv1_1
};
