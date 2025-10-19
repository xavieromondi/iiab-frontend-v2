import {readdirSync, readFileSync, writeFileSync} from 'fs';
import {join} from "path";


export default defineEventHandler(async (event) => {

	//directory.
	const dir = './server/api/sessions/sessions-data';

	// get users.
	if (event.method === 'GET') {
		//fetch all user files.
		let session_files = readdirSync(dir);

		//return users.
		return session_files.map(user => {
			const filePath = join(dir, user);
			return JSON.parse(readFileSync(filePath, 'utf8'));
		});
	} ///get users.


	// save session file
	else if (event.method === 'POST') {
		//get params validate.
		const body = await readBody(event);
		if (!body.class_ || !body.school) return {
			error: "Missing Credentials"
		};

		//session start time.
		if (!body.start_time) body.start_time = new Date().getTime();

		//build file name.
		const filename = `${body.class_}_${body.school}_${body.start_time}.json`;

		//write file.
		try {
			writeFileSync(`${dir}/${filename}`, JSON.stringify(body, null, 2));
			return {
				success: "Session Started",
				data   : body
			};
		}
		catch (e) {
			return {
				error: "Unable to start session"
			};
		}
	} //save session file.


	return null;
})