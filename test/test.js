const assert = require('assert');

describe('testing AppError', function(){


	describe('ExtendedError without langMap', function(){
		const AppError = require('..');
		const ExtendedError = AppError.extend('Extended');

		var error = new ExtendedError('Test:Error', { info : { testValue : 'xxx'} });

		it('InstanceOf - ExtendedError', function(){
			assert(error instanceof ExtendedError, 'Not ExtendedError instance')
		});

		it('InstanceOf - Parent', function(){
			assert(error instanceof AppError, 'Not AppError instance')
		});
		
		it('Input - Message', function(){
			assert.equal(error.message, 'Test:Error');
		})

		it('Input - Namespace', function(){
			assert.equal(error.ns, 'Extended');
		})

		it('Input - Other', function(){
			assert.deepEqual({
				info : { testValue : 'xxx'},
				from : null
			}, error, `Not deep equal example: ${JSON.stringify(Object.assign({}, error))}`)	
		});

	});

	describe('Extended with message nested error', function(){
		const AppError = require('..');
		const ExtendedError = AppError.extend('Extended');
		const WrappedError = AppError.extend('Wrapped');


		it("Input .message - from error", function(){
			var wrapped = new WrappedError('Any:Error');
			var extended = new ExtendedError(wrapped);

			assert.equal(extended.message, '::Wrapped::Any:Error');
		})
	})
})