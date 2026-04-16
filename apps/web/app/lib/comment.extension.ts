import { Mark, mergeAttributes } from "@tiptap/core";
import type { Range } from "@tiptap/core";
import type { Mark as PMMark } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    comment: {
      setComment: (commentId: string) => ReturnType;
      unsetComment: (commentId: string) => ReturnType;
      /** Mark a comment as resolved (applies resolvedCommentClass) */
      resolveComment: (commentId: string) => ReturnType;
      /** Undo resolution of a comment */
      unresolveComment: (commentId: string) => ReturnType;
    };
  }
  interface Storage {
    comment: CommentStorage;
  }
}

export interface MarkWithRange {
  mark: PMMark;
  range: Range;
}

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
  onCommentActivated: (commentId: string) => void;
  activeCommentClass: string;
  resolvedCommentClass: string; 
}

export interface CommentStorage {
  activeCommentId: string | null;
}

const Comment = Mark.create<CommentOptions, CommentStorage>({
  name: "comment",

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentActivated: () => {},
      activeCommentClass: "",
      resolvedCommentClass: "comment-resolved", 
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute("data-comment-id"),
        renderHTML: (attrs) => ({ "data-comment-id": attrs.commentId }),
      },
      resolved: {
        default: false,
        parseHTML: (el) =>
          (el as HTMLSpanElement).getAttribute("data-comment-resolved") === "true",
        renderHTML: (attrs) => ({
          "data-comment-resolved": attrs.resolved ? "true" : "false",
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-comment-id]",
        getAttrs: (el) =>
          !!(el as HTMLSpanElement).getAttribute("data-comment-id")?.trim() && null,
      },
    ];
  },

  addProseMirrorPlugins() {
    const extensionThis = this;
    return [
      new Plugin({
        key: new PluginKey("comment-active-decoration"),
        props: {
          decorations(state) {
            const activeCommentId = extensionThis.storage.activeCommentId;
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (!node.isInline) return;

              for (const mark of node.marks) {
                if (mark.type.name !== "comment") continue;

                if (mark.attrs.resolved && extensionThis.options.resolvedCommentClass) {
                  decorations.push(
                    Decoration.inline(pos, pos + node.nodeSize, {
                      class: extensionThis.options.resolvedCommentClass,
                    })
                  );
                }

                if (
                  activeCommentId &&
                  mark.attrs.commentId === activeCommentId &&
                  extensionThis.options.activeCommentClass
                ) {
                  decorations.push(
                    Decoration.inline(pos, pos + node.nodeSize, {
                      class: extensionThis.options.activeCommentClass,
                    })
                  );
                }
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  onSelectionUpdate() {
    const { $from } = this.editor.state.selection;
    const marks = $from.marks();

    if (!marks.length) {
      this.storage.activeCommentId = null;
      this.options.onCommentActivated("");
      return;
    }

    const commentMark = this.editor.schema.marks.comment;
    const activeCommentMark = marks.find((mark) => mark.type === commentMark);

    this.storage.activeCommentId = activeCommentMark?.attrs.commentId || null;
    this.options.onCommentActivated(this.storage.activeCommentId ?? "");
  },

  addStorage() {
    return {
      activeCommentId: null,
    };
  },

  addCommands() {
    const setResolvedState =
      (commentId: string, resolved: boolean) =>
      ({ tr, dispatch }: any) => {
        if (!commentId) return false;

        tr.doc.descendants((node: any, pos: number) => {
          const commentMark = node.marks.find(
            (mark: PMMark) =>
              mark.type.name === "comment" && mark.attrs.commentId === commentId
          );
          if (!commentMark) return;

          const newMark = commentMark.type.create({
            ...commentMark.attrs,
            resolved,
          });

          tr.removeMark(pos, pos + node.nodeSize, commentMark);
          tr.addMark(pos, pos + node.nodeSize, newMark);
        });

        return dispatch?.(tr);
      };

    return {
      setComment:
        (commentId) =>
        ({ commands }) => {
          if (!commentId) return false;
          commands.setMark("comment", { commentId });
          return true;
        },

      unsetComment:
        (commentId) =>
        ({ tr, dispatch }) => {
          if (!commentId) return false;

          const commentMarksWithRange: MarkWithRange[] = [];

          tr.doc.descendants((node, pos) => {
            const commentMark = node.marks.find(
              (mark) =>
                mark.type.name === "comment" && mark.attrs.commentId === commentId
            );
            if (!commentMark) return;
            commentMarksWithRange.push({ mark: commentMark, range: { from: pos, to: pos + node.nodeSize } });
          });

          commentMarksWithRange.forEach(({ mark, range }) => {
            tr.removeMark(range.from, range.to, mark);
          });

          return dispatch?.(tr);
        },

      // 👇 new commands
      resolveComment: (commentId) => setResolvedState(commentId, true),
      unresolveComment: (commentId) => setResolvedState(commentId, false),
    };
  },
});

export default Comment;