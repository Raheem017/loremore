

import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";

function CodeMirrorEditor({ initialDoc = "", onChange }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  // Create editor only once on mount
  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: initialDoc,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.updateListener.of((update) => {
          if (update.changes && onChange) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []); // Empty: create editor once

  // Update editor content when initialDoc prop changes (but avoid infinite loops)
  useEffect(() => {
    if (!viewRef.current) return;

    const currentDoc = viewRef.current.state.doc.toString();
    if (initialDoc !== currentDoc) {
      // Dispatch a transaction to update the content without recreating editor
      viewRef.current.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: initialDoc },
      });
    }
  }, [initialDoc]);

  return <div ref={editorRef} className="h-[300px]" />;
}

export default CodeMirrorEditor;
