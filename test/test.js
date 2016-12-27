const assert = require('assert');

describe('testing AppError', function(){
	const errorLangMap = {
		App : {
			'WithTemplateError' : (error) => `TemplateError with json: ${JSON.stringify(Object.assign(error.info))}`
		},
		Extended : {
			'Test:Error' : 'This is test error!',
			'InternalError' : 'Anything internal error'
		},
		Wrapped : {
			'Any:Error' : ({ info : { testString }, ns }) => `Wrapped Error! In ${ns}Error. testString: ${testString}`
		}
	};


	describe('ExtendedError without langMap', function(){
		const AppError = require('..')();
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

		it('toLocaleString - Catch no ns map error ', function(){
			try{
				error.toLocaleString()
			}catch(e){
				assert.equal(e.message, `No map for "${error.ns}" namespace`)
			}
		});

	});

	describe('ExtendedError with langMap', function(){
		const AppError = require('..')(errorLangMap);
		const ExtendedError = AppError.extend('Extended');



		it('toLocaleString - default for InternalError', function(){
			var error = new AppError;
			assert.equal(error.toLocaleString(), 'InternalError');
		})

		it('toLocaleString - String', function(){
			var error = new ExtendedError('Test:Error');
			assert.equal(error.toLocaleString(), errorLangMap.Extended['Test:Error']);
		})

		it('toLocaleString - String for InternalError', function(){
			var error = new ExtendedError;
			assert.equal(error.toLocaleString(), 'Anything internal error');
		})

		it('toLocaleString - Template', function(){
			var error = new AppError('WithTemplateError', {info : {testValue : 'XXX'}});
			assert.equal(
				error.toLocaleString(), 
				'TemplateError with json: {"testValue":"XXX"}'
			)
		})

	});

	describe('Extended with message nested error', function(){
		const AppError = require('..')(errorLangMap);
		const ExtendedError = AppError.extend('Extended');
		const WrappedError = AppError.extend('Wrapped');


		it("Input .message - from error", function(){
			var wrapped = new WrappedError('Any:Error');
			var extended = new ExtendedError(wrapped);

			assert.equal(extended.message, '::Wrapped::Any:Error');
		})

		it('Wrapped Error - from error', function(){
			var wrapped = new WrappedError('Any:Error');
			var extended = new ExtendedError(wrapped, {info : { testString : 'Hey!'}});

			assert.equal(extended.toLocaleString(), `Wrapped Error! In ExtendedError. testString: Hey!`);

		})

		it('WrappedError - from string', function(){
			var error = new WrappedError('::Extended::Test:Error');
			assert.equal(error.toLocaleString(), 'This is test error!')
		});

		it('WrappedError - from error and message', function(){
			var wrapped = new WrappedError('Any:Error');
			var extended = new ExtendedError(wrapped, 'Test:Error');
			assert.equal(extended.toLocaleString(), 'This is test error!');
		})
	})
})