import { describe, expect, it, vi } from 'vitest';
import { withTimeout } from './async-timeout';

describe('withTimeout', () => {
	it('rejects when the wrapped promise does not settle before the timeout', async () => {
		vi.useFakeTimers();

		const pendingPromise = new Promise<string>(() => {});
		const wrappedPromise = withTimeout(pendingPromise, 5000, 'Timed out');
		const expectation = expect(wrappedPromise).rejects.toThrow('Timed out');

		await vi.advanceTimersByTimeAsync(5000);

		await expectation;
		vi.useRealTimers();
	});

	it('resolves the wrapped promise when it settles before the timeout', async () => {
		vi.useFakeTimers();

		const wrappedPromise = withTimeout(Promise.resolve('ok'), 5000, 'Timed out');
		await vi.runAllTimersAsync();

		await expect(wrappedPromise).resolves.toBe('ok');
		vi.useRealTimers();
	});
});
