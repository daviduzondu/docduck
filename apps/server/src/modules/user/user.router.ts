import z from 'zod';
import { ctx } from '@/modules/auth/auth.middleware';
import { base, r } from '@/orpc/os';
import * as userService from "@/modules/user/user.service";

export const userRouter = base.prefix('/users').use(ctx).router({
 getBasicUserInfo:
  r.get('/{userId}', { inputStructure: 'detailed' })
   .input(z.object({
    params: z.object({
     userId: z.string()
    })
   })).handler(({ input }) => userService.getBasicUserInfo(input.params.userId))
})