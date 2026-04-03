import { documentRouter } from "@/modules/document/document.router";
import { invitationRouter } from "@/modules/invitation/invitation.router";

export const appRouter = {
 invitations: invitationRouter,
 documents: documentRouter
}
export type AppRouter = typeof appRouter; 
