import { StatusCodes } from "http-status-codes";
import { AppError } from "@/lib/utils";

export class DocumentNotFoundError extends AppError {
 constructor(statusCode = StatusCodes.NOT_FOUND) {
  super("The document you requested was not found", statusCode);
  this.name = "DocumentNotFoundError";
 }
}