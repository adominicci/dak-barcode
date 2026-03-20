import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { AuthContext, Target, UserRole } from '$lib/auth/types';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authContext: AuthContext;
			getVerifiedUser: () => Promise<User | null>;
			supabase: SupabaseClient;
		}
		interface PageData {
			activeTarget?: Target | null;
			displayName?: string | null;
			isAdmin?: boolean;
			userRole?: UserRole;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
