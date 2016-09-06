import fetch from 'isomorphic-fetch';

export default function (options) {

	options = options || {};

	return {

		cache: {},
		errorCache: {},
		MAX_NUM_RETRIES: options.maxNumRetries || 3,
		DEFAULT_EXPIRATION: options.expiration || 0,

		/**
		 * Make a request via the fetch API.
		 * Supports response caching, but responses expire immediately by default;
		 * pass `requestOptions.expiration` (ms) to maintain responses in the cache
		 * or configure with `options.expiration` sent to `transport()`.
		 * 
		 * @param  {String} url             URL to `fetch`.
		 * @param  {Function} parser        Custom parser to apply to response; defaults to `fetch`'s `response.json()`
		 * @param  {Object} requestOptions  Options; some are passed to `fetch()`, like `headers`;
		 *                                  others are used internally, like `expiration` or `statusOnly`
		 * @return {Promise}                Promise that resolves with the parsed response,
		 *                                  or rejects with any error generated during fetch/parse.
		 *                                  NOTE: If request is already in-flight, returns a Promise that does not resolve nor reject.
		 *                                  This is designed to work with the Redux pattern:
		 *                                  any Actions duplicating in-flight requests fail silently,
		 *                                  and the one Action whose request is actually processed will trigger a store change and application update.
		 */
		request: function (url, parser, requestOptions) {

			requestOptions = requestOptions || {};
			requestOptions.expiration = requestOptions.expiration || this.DEFAULT_EXPIRATION;

			if (!parser) {
				parser = this.parseJSON;
			}

			let returnVal = this.retrieveOrFetch(url, requestOptions);
			if (returnVal instanceof Promise) {

				// fetching; return fetch+parse Promise chain
				return returnVal
				.then(this.checkStatus)
				.then(response => !requestOptions.statusOnly ? parser(response) : Promise.resolve(response))
				.then(response => this.cacheResponse(url, response))
				.catch(error => {

					let numTries = this.cacheError(url, error);
					if (numTries < this.MAX_NUM_RETRIES) {
						// try again...
						console.warn(`Request failed on attempt ${numTries} of ${this.MAX_NUM_RETRIES} [url: ${url} ]`);
						return this.request(url, parser);
					} else {
						// i give up!

						// TODO: log to text file
						// TODO: email notifications
						console.error('Request failed:', error);

						throw error;
					}


				});

			} else {

				if (returnVal.responsePending) {

					// Actions duplicating already-in-flight requests
					// are returned an empty Promise that never resolves nor rejects.
					// Once the in-flight request resolves, it will trigger a store change
					// and application update, so it's safe to just let this action
					// fail silently.
					return new Promise((resolve, reject) => {});
					
				} else {

					// asynchronously return cached (already parsed) value wrapped in a Promise
					return new Promise((resolve, reject) => {
						setTimeout(() => {
							resolve(returnVal);
						}, 1);
					});

				}
				
			}


		},

		retrieveOrFetch: function (url, requestOptions) {

			let cached = this.cache[url];
			if (cached && performance.now() - cached.time < requestOptions.expiration) {

				// return cached value immediately if it's not past the expiration date
				return cached.value;

			} else {

				// fetch a new response,
				// and mark as in-flight to defend against rapid sequential requests
				this.cache[url] = {
					value: {
						responsePending: true
					},
					time: performance.now()
				};
				return fetch(url, requestOptions);

			}

		},

		checkStatus: function (response) {

			if (response.status < 400) {

				return response;

			} else {

				let error = new Error(response.statusText);
				error.response = response;
				throw error;

			}

		},

		parseJSON: function (response) {

			return response.json();

		},

		cacheResponse: function (key, value) {

			this.cache[key] = {
				value,
				time: performance.now()
			};
			delete this.errorCache[key];
			return value;

		},

		cacheError: function (key, error) {

			if (!this.errorCache[key]) {
				this.errorCache[key] = [];
			}

			let errors = this.errorCache[key];
			errors.push(error);

			return errors.length;

		}

	};

};
