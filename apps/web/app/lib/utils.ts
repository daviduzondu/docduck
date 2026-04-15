import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createAvatar } from '@dicebear/core';
import * as thumbs from '@dicebear/thumbs';
import { HocuspocusProvider } from "@hocuspocus/provider";
import { StatelessMessage } from "@/types";
import { Editor } from "@tiptap/core";
import * as Y from 'yjs';


export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}

function hashString(str: string): number {
 let hash = 0;
 for (let i = 0; i < str.length; i++) {
  hash = str.charCodeAt(i) + ((hash << 5) - hash);
  hash |= 0; // Convert to 32bit int
 }
 return Math.abs(hash);
}
function hslToHex(h: number, s: number, l: number): string {
 s /= 100;
 l /= 100;
 const a = s * Math.min(l, 1 - l);
 const f = (n: number) => {
  const k = (n + h / 30) % 12;
  const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return Math.round(255 * color).toString(16).padStart(2, '0');
 };
 return `#${f(0)}${f(8)}${f(4)}`;
}

export function getUserColor(userId: string): string {
 const hash = hashString(userId);
 const hue = hash % 360;
 return hslToHex(hue, 70, 45);
}

export const generateAnonymousAvatar = (seed: string) => createAvatar(thumbs, {
 seed
});

export function sendStateless<T = any>(provider: HocuspocusProvider, data: StatelessMessage<T>) {
 provider.sendStateless(JSON.stringify(data));
}

// yjs docs are sparse, so the best source of truth is often the dmonad answering questions in Gitter, GitHub issues, or community forums. I'm going insane lol.
// export function getSelectionAsRelativePositions(editor: Editor) {
//  const { from, to } = editor.state.selection
//  console.log(editor.state.selection)
//  const ystate = ySyncPluginKey.getState(editor.state)

//  const relFrom = absolutePositionToRelativePosition(from, ystate.type, ystate.binding.mapping)
//  const relTo = absolutePositionToRelativePosition(to, ystate.type, ystate.binding.mapping)

//  return {
//   from: Y.encodeRelativePosition(relFrom),
//   to: Y.encodeRelativePosition(relTo),
//  }
// }


export function stripMarks(node: any, markNames = new Set()) {
 if (!node) return node

 // TEXT NODE
 if (node.type === "text") {
  if (!node.marks) return node

  return {
   ...node,
   marks: node.marks.filter((mark: any) => !markNames.has(mark.type)),
  }
 }

 // NON-TEXT NODE
 if (node.content && Array.isArray(node.content)) {
  return {
   ...node,
   content: node.content.map((child: any) =>
    stripMarks(child, markNames)
   ),
  }
 }

 return node
}