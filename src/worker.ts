import PocketBase from 'pocketbase';

export interface Env {
	ADMIN_EMAIL: string;
	ADMIN_PASSWORD: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const pb = new PocketBase('https://api.moveto.kr');
		const loginAdmin = await pb.admins.authWithPassword(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
		if (!loginAdmin) return new Response('Admin Auth Error');

		const records = await pb.collection('files').getFullList({ expand: 'user' });
		const currentTime = new Date();

		let deletedFile = [];

		for (let i = 0; i < records.length; i += 1) {
			if (records[i].files.length > 0) {
				let downloadTime = 5 * 60000;
				const userInfo = records[i].expand.user;
				if (userInfo) {
					//@ts-ignore
					if (userInfo.plan === 'FREE') {
						downloadTime = 10 * 60000;
						//@ts-ignore
					} else if (userInfo.plan === 'BASIC') {
						downloadTime = 30 * 60000;
						//@ts-ignore
					} else if (userInfo.plan === 'PRO') {
						downloadTime = 60 * 60000;
					}
				}
				let createdDate = new Date(records[i].created);
				const expireTime = new Date(createdDate.getTime() + downloadTime);
				const isBeforeNow = expireTime < currentTime;
				if (isBeforeNow) {
					const deleteFile = await pb.collection('files').update(records[i].id, { files: [] });
					deletedFile.push(deleteFile);
				}
			}
		}

		const json = JSON.stringify(deletedFile, null, 2);

		return new Response(json, {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		});
	},
};
