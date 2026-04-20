import { AppError } from "@/lib/helpers";
import { onError, ORPCError } from "@orpc/server";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { NoResultError } from "kysely";

export const onErrorCallback = <T extends typeof onError>(...[err]: Parameters<Parameters<T>[0]>) => {
 console.log(err)
 // TODO: Improve error handling and type-safety
 if (err instanceof ORPCError) throw err;
 if (err instanceof AppError) throw new ORPCError(StatusCodes[err.statusCode]!, {
  status: err.statusCode,
  message: err.message,
 })
 else if (err instanceof SyntaxError && 'body' in err) {
  throw new ORPCError(getReasonPhrase(StatusCodes.BAD_REQUEST), { message: err.message });
 } else if (err instanceof NoResultError) throw new ORPCError(getReasonPhrase(StatusCodes.NOT_FOUND), { message: "The resource you tried to access could not be found" })
 else throw new ORPCError(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), {
  message: "Internal server error"
 });
}