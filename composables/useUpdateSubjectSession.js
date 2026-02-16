import {useSaveSession} from "~/composables/useSaveSession.js";

export async function useUpdateSubjectSession(subject_name) {
	if (!subject_name) return;

	//update session.
	const session = useState('session').value;
	if (!session.data) return;

	//session data init.
	let session_data = session.data;
	if (!session_data.entries) session_data.entries = {};

	//entry data init
	if (!session_data.entries[subject_name]) {
		session_data.entries[subject_name] = {
			name              : subject_name,
			views             : 1,
			rating            : 3,
			session_total_time: 0,
			start_time        : new Date().getTime()
		};
	}

	//entry data update.
	else {
		session_data.entries[subject_name].views++;
		const subject_start_time = session_data.entries[subject_name].start_time;
		session_data.entries[subject_name].session_total_time += new Date().getTime() - subject_start_time;
	}

	//save session.
	await useSaveSession();

	//matomo tracking.
	if (process.client && window._paq) {
		_paq.push(['trackEvent', 'Subject', 'View', subject_name]);
	}
}
