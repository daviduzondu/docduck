import { appRouter } from '@/orpc/app.router';
import { minifyContractRouter } from '@orpc/contract';
import fs from 'fs';
import path from 'path';

export const generateContract = () => {
 fs.writeFileSync(path.resolve(process.cwd(), 'src', 'orpc', 'contract.json'), JSON.stringify(minifyContractRouter(appRouter)));
}
