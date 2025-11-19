export function useThumbnail(subject) {

	//param check.
	if (!subject || typeof subject !== 'string') {
		return 'social.jpg'
	}

	//text - lowercase.
	const text = subject.toLowerCase();

	// Specific subjects
	if (text.includes('computer') || text.includes('technolog')) return 'technology.jpg'
	if (text.includes('english') || text.includes('grammar')) return 'english.jpg'
	if (text.includes('chemistry') || text.includes('lab')) return 'science.jpg'
	if (text.includes('math') || text.includes('calculat')) return 'math.jpg'
	if (text.includes('christ') || text.includes('church')) return 'church.jpg'
	if (text.includes('swahili')) return 'swahili.jpg'
	if (text.includes('geograp') || text.includes('environ') || text.includes('earth')) return 'nature.jpg'
	if (text.includes('electr') || text.includes('engineer')) return 'electronics.jpg'
	if (text.includes('agricul') || text.includes('hygiene') || text.includes('nutrition')) return 'food.jpg'
	if (text.includes('science')) return 'science.jpg'

	// Default image
	return 'social.jpg'
}
