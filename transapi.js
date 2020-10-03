const nacl = require("tweetnacl");
const crypto = require("crypto");


function makeTransaction(data, private_key)
{
	return new Promise((res,rej)=>
		{
			crypto.randomBytes(16, (err, buf)=>
				{
					const nonce = buf.toString('hex');
					if(!data.origin)data.origin="bouncer";
					data.nonce = nonce;
					data.timestamp = +new Date();
					const privkey = hexToBuffer(private_key);
					
					let message = _getMergedMessage(data);

					if(typeof message != 'string' && !(message instanceof String))
					{
						rej("Couldn't merge message");
					}
					const te = new TextEncoder();
					message = te.encode(message);
					data.signature = bufferToHex(
						nacl.sign.detached(message, privkey)
					);
					res(data);
				});
		}
	);
}
function bufferToHex(buffer) {
	return "0x"+[...new Uint8Array(buffer)]
		.map(b => b.toString(16).padStart(2, "0"))
		.join("");
}

function hexToBuffer(hexString) {
	// remove the leading 0x
	hexString = hexString.replace(/^0x/, '');

	// ensure even number of characters
	if (hexString.length % 2 != 0) {
		throw new Error('WARNING: expecting an even number of characters in the hexString');
	}

	// check for some non-hex characters
	const bad = hexString.match(/[G-Z\s]/i);
	if (bad) {
		throw new Error('WARNING: found non-hex characters', bad);    
	}

	// split the string into pairs of octets
	const pairs = hexString.match(/[\dA-F]{2}/gi);

	// convert the octets to integers
	const integers = pairs.map(function(s) {
		return parseInt(s, 16);
	});

	const array = new Uint8Array(integers);

	return array;
}

function _getMergedMessage(data)
{
	const merged_message = data.version + data.type + data.origin
		+ data.for + data.content + data.timestamp + data.nonce;
	if(typeof merged_message != 'string' && !(merged_message instanceof String))
	{
		throw new Error("Couldn't merge message");
	}
	return merged_message;
}

module.exports = {
	"makeTransaction": makeTransaction
};
