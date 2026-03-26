const FIXED_EMAIL_DOMAIN = '@dakotasteelandtrim.com';

function getInputValue(formElement: HTMLFormElement, name: string) {
	const namedField = formElement.elements.namedItem(name);
	const field =
		namedField && 'value' in namedField && typeof namedField.value === 'string'
			? namedField
			: formElement.querySelector(`input[name="${name}"]`);

	return field && 'value' in field && typeof field.value === 'string' ? field.value.trim() : '';
}

function getFormDataValue(formData: FormData, name: string) {
	const value = formData.get(name);

	return typeof value === 'string' ? value.trim() : '';
}

function extractUsername(value: string) {
	return value.trim().replace(/@dakotasteelandtrim\.com$/i, '').trim();
}

function normalizeFixedDomainEmail(value: string) {
	const normalizedValue = value.trim().toLowerCase();

	if (!normalizedValue) {
		return '';
	}

	return normalizedValue.endsWith(FIXED_EMAIL_DOMAIN)
		? normalizedValue
		: `${normalizedValue.replace(/@.*$/, '')}${FIXED_EMAIL_DOMAIN}`;
}

export function syncFixedDomainEmailFormData(formElement: HTMLFormElement, formData: FormData) {
	const username = extractUsername(
		getFormDataValue(formData, 'username') || getInputValue(formElement, 'username')
	);

	if (username) {
		formData.set('username', username);
	}

	const email = normalizeFixedDomainEmail(
		getFormDataValue(formData, 'email') ||
			getInputValue(formElement, 'email') ||
			username
	);

	if (email) {
		formData.set('email', email);
	}
}
