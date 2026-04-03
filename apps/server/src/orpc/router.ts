import { documentRouter } from "@/modules/document/document.router";
import { invitationRouter } from "@/modules/invitation/invitation.router";

export const router = {
 invitations: invitationRouter,
 documents: documentRouter
}