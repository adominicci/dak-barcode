import * as v from 'valibot';
import { command, query } from '$app/server';
import {
	getDstWillCallDropsheet,
	getDstWillCallSignature,
	uploadDstWillCallSignature
} from '$lib/server/dst-queries';

const willCallLoadNumberSchema = v.pipe(
	v.string(),
	v.trim(),
	v.nonEmpty('Scan a delivery number to continue.')
);

const willCallSignatureUploadInputSchema = v.object({
	dropSheetId: v.number(),
	signaturePath: v.pipe(v.string(), v.trim(), v.nonEmpty('Signature path is required.')),
	receivedBy: v.pipe(v.string(), v.trim())
});

export const lookupWillCallDropsheet = query(willCallLoadNumberSchema, async (loadNumber) =>
	getDstWillCallDropsheet(loadNumber)
);

export const getWillCallSignature = query(v.number(), async (dropSheetId) =>
	getDstWillCallSignature(dropSheetId)
);

export const uploadWillCallSignature = command(
	willCallSignatureUploadInputSchema,
	async (input) => uploadDstWillCallSignature(input)
);
