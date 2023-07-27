export interface Env {
	CLOUDFLARE_ACCOUNT_ID: string;
	R2_ACCESSKEY: string;
	R2_PRIVITEKEY: string;
}

type TargetDataType = {
	fileKeys: string[];
};

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const targetFiles = await fetch('http://localhost:3000/api/share/delete', {
			method: 'PUT',
			body: JSON.stringify({ id: 'jhyunwoo0228@gmail.com', password: 'bcKboZsfgt5XRW7rRbxk' }),
		});
		const targetData: TargetDataType = await targetFiles.json();

		const S3 = new S3Client({
			region: 'auto',
			endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.R2_ACCESSKEY!,
				secretAccessKey: env.R2_PRIVITEKEY!,
			},
		});

		for (let i = 0; i < targetData.fileKeys.length; i += 1) {
			try {
				const input = {
					// DeleteObjectRequest
					Bucket: 'moveto-bucket', // required
					Key: targetData.fileKeys[i], // required
				};
				const command = new DeleteObjectCommand(input);
				await S3.send(command);
			} catch {}
		}
		const json = JSON.stringify(targetData, null, 2);
		return new Response(json, {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		});
	},
	async scheduled(request: Request, env: Env, ctx: ExecutionContext) {
		async function deleteFiles() {
			const targetFiles = await fetch('https://www.moveto.kr/api/share/delete', {
				method: 'PUT',
				body: JSON.stringify({ id: 'jhyunwoo0228@gmail.com', password: 'bcKboZsfgt5XRW7rRbxk' }),
			});
			const targetData: TargetDataType = await targetFiles.json();

			const S3 = new S3Client({
				region: 'auto',
				endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
				credentials: {
					accessKeyId: env.R2_ACCESSKEY!,
					secretAccessKey: env.R2_PRIVITEKEY!,
				},
			});

			for (let i = 0; i < targetData.fileKeys.length; i += 1) {
				console.log(targetData.fileKeys[i]);
				try {
					const input = {
						// DeleteObjectRequest
						Bucket: 'moveto-bucket', // required
						Key: targetData.fileKeys[i], // required
					};
					const command = new DeleteObjectCommand(input);
					await S3.send(command);
				} catch {}
			}
			const json = JSON.stringify(targetData, null, 2);
			return new Response(json, {
				headers: {
					'content-type': 'application/json;charset=UTF-8',
				},
			});
		}
		ctx.waitUntil(deleteFiles());
	},
};
