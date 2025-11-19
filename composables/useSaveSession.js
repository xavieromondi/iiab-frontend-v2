import {useNotify} from "~/composables/useNotify.js";

export async function useSaveSession() {

	//session update.
	const session_data    = useState('session').value.data;
	session_data.end_time = new Date().getTime();

	//save session.
	try {
		await $fetch(useState('server_url').value + 'sessions', {
			method: 'POST',
			body  : JSON.stringify(session_data)
		});

		return 1
	}

	catch (e) { //client error.
		return 0;
	}

}
