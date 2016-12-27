const InternalError = 'InternalError';
const defaultErrorLangMap = {
	App : { InternalError }
}

const parseFromString = message => {
	let indexSeparator = message.indexOf('::', 2);
	return [message.substring(2, indexSeparator), message.substring(indexSeparator+2)]
}

module.exports = function(errorLangMap = defaultErrorLangMap){
	return class AppError extends Error {

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

			var { from, info } = options;

			if(wrappedMessageMap){
				this.wrappedFrom = wrappedMessageMap[0];
				this.wrappedMessage = wrappedMessageMap[1];
			}

			this.from 		= from;
			this.info 		= info;


			if (typeof Error.captureStackTrace === 'function')
				Error.captureStackTrace(this, this.constructor);

			// client implimentation
			else
				this.stack = (new Error(message)).stack; 
		}
		get ns (){
			return 'App'
		}

		toJSON (){
			return this.message;
		}

		toString () {
			return this.message;
		}

		toLocaleString () {
			var ns = this.wrappedFrom || this.ns,
				message = this.wrappedMessage || this.message;

			let errorNS = errorLangMap[ns];
			if (typeof errorNS !== "object")
				throw new Error(`No map for "${ns}" namespace`);

			var result = errorNS[message];

			if(!result && message === InternalError)
				result = InternalError;

			if(typeof result === "function")
				result = result(this);

			return result;
		}

		static extend(ns) {

			return class extends this {

				get ns () {
					return ns
				}
			}

		}
	}
};