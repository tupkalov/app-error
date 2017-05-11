const InternalError = 'InternalError';

const parseFromString = message => {
	var indexSeparator = message.indexOf('::', 2);
	return [message.substring(2, indexSeparator), message.substring(indexSeparator+2)]
}


class AppError extends Error {

	constructor(first, second, third) {
		var wrappedFrom, wrappedMessage;

		var from, message, options, wrappedMessageMap;

		// message == null
		if(!first)
			first = InternalError;

		// message[, options]
		if(typeof first === "string"){
			from = null;
			message = first;

			if(message.startsWith('::'))
				wrappedMessageMap = parseFromString(message);

			if(typeof second === "object")
				options = second;
			else
				options = {};
		}else

		// error[, message][, options]
		if(!(first instanceof AppError))
			throw new Error('Unexpected typeof first argument');

		else{
			from = first;

			// error, message[, options]
			if(typeof second === "string"){
				message = second;
				options = third || {};

			// error[, options]
			}else{
				if(from.message.startsWith('::')){
					message = from.message;
					wrappedMessageMap = parseFromString(message)
				}else{
					message = `::${from.ns}::${from.message}`;
					wrappedMessageMap = [from.ns, from.message];
				}

				options = second || {};
			}
		}

		super(message);

		Object.assign(this, options);

		if(wrappedMessageMap){
			this.wrappedFrom = wrappedMessageMap[0];
			this.wrappedMessage = wrappedMessageMap[1];
		}

		this.from 		= from;


		if (typeof Error.captureStackTrace === 'function')
			Error.captureStackTrace(this, this.constructor);

		// client implimentation
		else
			this.stack = (new Error(message)).stack; 
	}

	toJSON (){
		return this.message;
	}

	toString () {
		return this.message;
	}

	static extend(ns) {

		return class extends this {

			get ns () {
				return ns
			}
		}

	}
}

module.exports = AppError.extend('App');