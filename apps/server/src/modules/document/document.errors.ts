import { StatusCodes } from "http-status-codes";
import { AppError } from "@/lib/helpers";

export class DocumentNotFoundError extends AppError {
 constructor(statusCode = StatusCodes.NOT_FOUND) {
  super("The document you requested was not found", statusCode);
  this.name = "DocumentNotFoundError";
 }
}

export class DocumentAccessNotAllowedError extends AppError {
 constructor(statusCode = StatusCodes.FORBIDDEN) {
  super("Sorry. You do not have access to this document", statusCode);
  this.name = "DocumentAccessNotAllowedError";
 }
}