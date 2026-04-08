export type StatelessMessage<T> = {
 type: "update:title",
 data: T
}