import React, { useState, useMemo, useCallback } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";

const defaultInitialValue = [
  {
    type: "paragraph",
    children: [{ text: "This is a default paragraph. You can start editing here." }],
  },
];

const RichTextEditor = ({ initialValue = defaultInitialValue, onChange }) => {
  const [value, setValue] = useState(initialValue);
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "paragraph":
        return <p {...props.attributes}>{props.children}</p>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <span {...props.attributes}>{props.children}</span>;
  }, []);

  const handleChange = (newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Slate editor={editor} value={value} onChange={handleChange}>
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} placeholder="Enter some text..." />
    </Slate>
  );
};

export default RichTextEditor;
