export const APP_VERSION = 'v2.0';

export const APP_RELEASE_HISTORY = [
	{
		version: APP_VERSION,
		date: 'June 3, 2026',
		title: 'Stage & Load version visibility',
		changes: [
			'Displays the active app version on login and authenticated headers.',
			'Adds an in-app version history dialog from the version badge.'
		]
	}
] as const;
