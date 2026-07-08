import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { hasRichTextContent } from "../utils/richTextUtils";
import "./RichTextEditor.css";

const BlockEmbed = Quill.import("blots/block/embed");
const SizeStyle = Quill.import("attributors/style/size");
SizeStyle.whitelist = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
Quill.register(SizeStyle, true);

class HorizontalRuleBlot extends BlockEmbed {
  static create() {
    return document.createElement("hr");
  }

  static value() {
    return true;
  }
}

HorizontalRuleBlot.blotName = "horizontalRule";
HorizontalRuleBlot.tagName = "hr";
Quill.register(HorizontalRuleBlot);

const HEADER_LEVELS = [1, 2, 3, 4, 5, 6];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write something…",
  minHeight = 280,
  invalid = false,
}) {
  const quillRef = useRef(null);
  const colorInputRef = useRef(null);
  const [activeHeader, setActiveHeader] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const [activeSize, setActiveSize] = useState("16px");

  const getEditor = () => quillRef.current?.getEditor?.();

  const updateToolbarState = useCallback(() => {
    const quill = getEditor();
    if (!quill) return;

    const range = quill.getSelection();
    const format = range ? quill.getFormat(range) : {};
    setActiveHeader(format.header || false);
    setActiveSize(format.size || "16px");
    setActiveFormats({
      bold: !!format.bold,
      italic: !!format.italic,
      underline: !!format.underline,
    });
  }, []);

  useEffect(() => {
    const quill = getEditor();
    if (!quill) return undefined;

    const handler = () => updateToolbarState();
    quill.on("selection-change", handler);
    quill.on("text-change", handler);
    updateToolbarState();

    return () => {
      quill.off("selection-change", handler);
      quill.off("text-change", handler);
    };
  }, [updateToolbarState, value]);

  const handleChange = (content) => {
    onChange?.(hasRichTextContent(content) ? content : "");
  };

  const focusEditor = () => getEditor()?.focus();

  const setHeader = (level) => {
    focusEditor();
    const quill = getEditor();
    if (!quill) return;
    quill.format("header", level === false ? false : level);
    updateToolbarState();
  };

  const toggleFormat = (name) => {
    focusEditor();
    const quill = getEditor();
    if (!quill) return;
    const current = quill.getFormat()[name];
    quill.format(name, !current);
    updateToolbarState();
  };

  const setFontSize = (size) => {
    focusEditor();
    const quill = getEditor();
    if (!quill) return;
    quill.format("size", size || false);
    updateToolbarState();
  };

  const insertHorizontalRule = () => {
    const quill = getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    const index = range ? range.index : quill.getLength();
    quill.insertEmbed(index, "horizontalRule", true, Quill.sources.USER);
    quill.insertText(index + 1, "\n", Quill.sources.SILENT);
    quill.setSelection(index + 2, Quill.sources.SILENT);
  };

  const openColorPicker = () => {
    focusEditor();
    colorInputRef.current?.click();
  };

  const applyColor = (event) => {
    const quill = getEditor();
    if (!quill) return;
    quill.format("color", event.target.value);
  };

  const modules = useMemo(() => ({ toolbar: false }), []);
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "size",
    "color",
    "horizontalRule",
  ];

  return (
    <div
      className={`rich-text-editor${invalid ? " rich-text-editor--invalid" : ""}`}
    >
      <div className="rich-text-editor__toolbar">
        <div className="rich-text-editor__group">
          {HEADER_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`rich-text-editor__btn rich-text-editor__btn--tag${
                activeHeader === level ? " is-active" : ""
              }`}
              onClick={() => setHeader(level)}
            >
              H{level}
            </button>
          ))}
          <button
            type="button"
            className={`rich-text-editor__btn rich-text-editor__btn--tag${
              !activeHeader ? " is-active" : ""
            }`}
            onClick={() => setHeader(false)}
          >
            P
          </button>
        </div>

        <span className="rich-text-editor__divider" aria-hidden="true" />

        <div className="rich-text-editor__group">
          <label className="rich-text-editor__size-label" htmlFor="rte-size">
            Size
          </label>
          <select
            id="rte-size"
            className="rich-text-editor__size-select"
            value={activeSize}
            onChange={(e) => setFontSize(e.target.value)}
            aria-label="Font size"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size.replace("px", "")}
              </option>
            ))}
          </select>
        </div>

        <span className="rich-text-editor__divider" aria-hidden="true" />

        <div className="rich-text-editor__group">
          <button
            type="button"
            className={`rich-text-editor__btn rich-text-editor__btn--icon${
              activeFormats.bold ? " is-active" : ""
            }`}
            onClick={() => toggleFormat("bold")}
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`rich-text-editor__btn rich-text-editor__btn--icon${
              activeFormats.italic ? " is-active" : ""
            }`}
            onClick={() => toggleFormat("italic")}
            aria-label="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`rich-text-editor__btn rich-text-editor__btn--icon${
              activeFormats.underline ? " is-active" : ""
            }`}
            onClick={() => toggleFormat("underline")}
            aria-label="Underline"
          >
            <u>U</u>
          </button>
        </div>

        <span className="rich-text-editor__divider" aria-hidden="true" />

        <div className="rich-text-editor__group">
          <button
            type="button"
            className="rich-text-editor__color-trigger"
            onClick={openColorPicker}
            aria-label="Text color"
          >
            <span className="rich-text-editor__color-swatch" />
            <span className="rich-text-editor__color-letter">A</span>
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className="rich-text-editor__color-input"
            defaultValue="#014d40"
            onChange={applyColor}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        <span className="rich-text-editor__divider" aria-hidden="true" />

        <div className="rich-text-editor__group">
          <button
            type="button"
            className="rich-text-editor__btn rich-text-editor__btn--icon"
            onClick={insertHorizontalRule}
            aria-label="Horizontal line"
          >
            —
          </button>
        </div>
      </div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="rich-text-editor__quill"
        style={{ "--rte-min-height": `${minHeight}px` }}
      />
    </div>
  );
}
