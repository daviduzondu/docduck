import { AppError } from "@/lib/helpers";
import { db } from "@/lib/kysely";
import { StatusCodes } from "http-status-codes";

export async function getBasicUserInfo(userId: string) {
 return await db.selectFrom('user').where('id', '=', userId).select(['image', 'name', 'isAnonymous']).executeTakeFirstOrThrow(() => {
  throw new AppError("User with provided ID not found", StatusCodes.NOT_FOUND)
 })
}