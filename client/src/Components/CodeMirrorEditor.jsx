
import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";

function CodeMirrorEditor({ initialDoc = "", onChange, readOnly = false }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // ✅ DESTROY old instance if it exists
    viewRef.current?.destroy();

    // ✅ Create new editor with correct readOnly value
    const state = EditorState.create({
      doc: initialDoc,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.changes && onChange) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    // ✅ Cleanup on unmount
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [readOnly]); // ✅ Re-run whenever `readOnly` changes

  // Optional: Update content if `initialDoc` changes externally
  useEffect(() => {
    if (!viewRef.current) return;
    const currentDoc = viewRef.current.state.doc.toString();
    if (initialDoc !== currentDoc) {
      viewRef.current.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: initialDoc },
      });
    }
  }, [initialDoc]);

  return (
    <div
      ref={editorRef}
      className={`h-[300px]  ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"
      }`}
    />
  );
}

export default CodeMirrorEditor;
