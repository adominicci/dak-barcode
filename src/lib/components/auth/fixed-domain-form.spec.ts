import { describe, expect, it } from 'vitest';
import { syncFixedDomainEmailFormData } from './fixed-domain-form';

function createFormElement(fields: Record<string, string>) {
	return {
		elements: {
			namedItem(name: string) {
				if (!(name in fields)) {
					return null;
				}

				return {
					value: fields[name]
				};
			}
		},
		querySelector(selector: string) {
			const match = selector.match(/input\[name="(.+)"\]/);

			if (!match) {
				return null;
			}

			const name = match[1];

			if (!(name in fields)) {
				return null;
			}

			return {
				value: fields[name]
			};
		}
	} as HTMLFormElement;
}

describe('syncFixedDomainEmailFormData', () => {
	it('repairs blank submitted username and email fields from the live form values', () => {
		const formElement = createFormElement({
			username: 'andresd',
			email: ''
		});

		const formData = new FormData();
		formData.set('username', '');
		formData.set('email', '');
		formData.set('password', '12345678');

		syncFixedDomainEmailFormData(formElement, formData);

		expect(formData.get('username')).toBe('andresd');
		expect(formData.get('email')).toBe('andresd@dakotasteelandtrim.com');
		expect(formData.get('password')).toBe('12345678');
	});

	it('preserves an already-submitted username while normalizing a stale email', () => {
		const formElement = createFormElement({
			username: '',
			email: 'staleuser@dakotasteelandtrim.com'
		});

		const formData = new FormData();
		formData.set('username', 'andresd');
		formData.set('email', 'staleuser@dakotasteelandtrim.com');

		syncFixedDomainEmailFormData(formElement, formData);

		expect(formData.get('username')).toBe('andresd');
		expect(formData.get('email')).toBe('staleuser@dakotasteelandtrim.com');
	});

	it('falls back to querying the live input elements when namedItem does not expose a value', () => {
		const formElement = {
			elements: {
				namedItem() {
					return {};
				}
			},
			querySelector(selector: string) {
				if (selector === 'input[name="username"]') {
					return { value: 'andresd' };
				}

				if (selector === 'input[name="email"]') {
					return { value: '' };
				}

				return null;
			}
		} as unknown as HTMLFormElement;

		const formData = new FormData();
		formData.set('username', '');
		formData.set('email', '');

		syncFixedDomainEmailFormData(formElement, formData);

		expect(formData.get('username')).toBe('andresd');
		expect(formData.get('email')).toBe('andresd@dakotasteelandtrim.com');
	});
});
