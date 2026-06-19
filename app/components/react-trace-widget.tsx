"use client";

import { Trace } from "@react-trace/core";
import { CopyToClipboardPlugin } from "@react-trace/plugin-copy-to-clipboard";
import { OpenEditorPlugin } from "@react-trace/plugin-open-editor";
import { PreviewPlugin } from "@react-trace/plugin-preview";

export default function ReactTraceWidget({ root }: { root: string }) {
  return (
    <Trace
      root={root}
      position="bottom-left"
      minimized
      plugins={[
        PreviewPlugin({ disabled: true }),
        CopyToClipboardPlugin(),
        OpenEditorPlugin({ editor: "vscode" }),
      ]}
    />
  );
}
