import { AxiosHeaders } from "axios";
import { api } from "./client";

export async function checkDocumentPermissions(documentId: string, headers?: AxiosHeaders) {
 const { data } = await api.get(`/documents/${documentId}/permissions`, { headers });
 return data;
}