type PageTitleData = {
	loadNumber?: string | null;
};

function formatTitle(baseTitle: string, loadNumber: string | null | undefined): string {
	if (loadNumber && loadNumber.trim().length > 0) {
		return `${baseTitle} ${loadNumber.trim()} - Stage & Load`;
	}

	return `${baseTitle} - Stage & Load`;
}

export function getPageTitle(pathname: string, data: PageTitleData = {}): string {
	const loadNumber = data.loadNumber ?? null;

	if (pathname === '/login') {
		return 'Sign In - Stage & Load';
	}

	if (pathname === '/forgot-password') {
		return 'Forgot Password - Stage & Load';
	}

	if (pathname === '/reset-password') {
		return 'Reset Password - Stage & Load';
	}

	if (pathname === '/logout') {
		return 'Logout - Stage & Load';
	}

	if (pathname === '/inactive') {
		return 'Account Inactive - Stage & Load';
	}

	if (pathname === '/home') {
		return 'Home - Stage & Load';
	}

	if (pathname === '/location') {
		return 'Target Selector - Stage & Load';
	}

	if (pathname === '/account') {
		return 'Account - Stage & Load';
	}

	if (pathname === '/loaders') {
		return 'Add Loader - Stage & Load';
	}

	if (pathname === '/staging') {
		return 'Staging - Stage & Load';
	}

	if (pathname === '/dropsheets') {
		return 'Dropsheets - Stage & Load';
	}

	if (pathname === '/loading') {
		return formatTitle('Loading', loadNumber);
	}

	if (pathname.startsWith('/select-category/')) {
		return formatTitle('Select Category', loadNumber);
	}

	if (pathname.startsWith('/order-status/')) {
		return formatTitle('Order Status', loadNumber);
	}

	if (pathname.startsWith('/move-orders/')) {
		return formatTitle('Move Orders', loadNumber);
	}

	return 'Stage & Load';
}
