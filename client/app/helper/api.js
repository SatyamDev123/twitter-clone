export function get(url) {
	return fetch(url).then(response => response.json()).catch(error => {
		//TODO: handle error
		console.error(error);
	});
}

export function post(url, payload) {
	return fetch(url, {
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	})
		.then(function(res) {
			return res.json();
		})
		.catch(error => {
			//TODO: handle error
			console.error(error);
		});
}

export default {
	get,
	post
};
