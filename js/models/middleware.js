const logger = store => next => action => {

	console.log('dispatching:', action);
	let result = next(action);

	console.log('next state:', store.getState());
	return result;

};

const crashReporter = store => next => action => {

	try {
		return next(action);
	} catch (error) {

		// TODO: log
		console.error('', error, action, store.getState());
		throw error;
	}

};

export default [
	// logger,
	// crashReporter
];
