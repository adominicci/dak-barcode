type RemoteQueryRead<T> = PromiseLike<T> & {
	run?: () => Promise<T>;
};

export async function readRemoteQuery<T>(query: RemoteQueryRead<T>): Promise<T> {
	if (typeof query.run === 'function') {
		return query.run();
	}

	return await query;
}
