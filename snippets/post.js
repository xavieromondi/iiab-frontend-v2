// modules init
const express = require("express");
const nodemailer = require("nodemailer");

// server init
const app = express();
app.use(express.json());

// mail settings (load from env)
const user_auth = {
	user: process.env.MAIL_USER,
	pass: process.env.MAIL_PASS
};

// POST /send
app.post("/send", async (req, res) => {
	const { email, subject, message } = req.body;

	if (!email || !subject || !message) {
		return res.status(400).json({ error: "Missing fields" });
	}

	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: user_auth
		});

		const info = await transporter.sendMail({
			from: user_auth.user,
			to: "info@accesshub-africa.com",
			subject: `Website Enquiry | ${subject} | ${email}`,
			text: message
		});

		res.json({
			success: true,
			messageId: info.messageId
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Email failed" });
	}
});

// server start
app.listen(3000, () => console.log("Server running on port 3000"));
