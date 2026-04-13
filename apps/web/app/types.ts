export type StatelessMessage<T> = {
 type: "update:title",
 data: T
}

export type AwarenessStates = {
 name: string, color: string, image?: string, isAnonymous: boolean, role: "VIEWER" | "EDITOR" | "OWNER"
 id: string
}