import { documentRouter } from "@/modules/document/document.router";
import { invitationRouter } from "@/modules/invitation/invitation.router";
import { userRouter } from "@/modules/user/user.router";

export const appRouter = {
 invitations: invitationRouter,
 documents: documentRouter,
 users: userRouter
}
export type AppRouter = typeof appRouter; 
