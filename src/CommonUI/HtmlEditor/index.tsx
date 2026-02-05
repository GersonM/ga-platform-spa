import React, {useContext, useMemo, useRef, useState} from 'react';
import JoditEditor from "jodit-react";
import AuthContext from "../../Context/AuthContext.tsx";

interface HtmlEditorProps {
  title?: string;
  value?: string;
  placeholder?: string;
  height?: number;
}

const HtmlEditor = ({placeholder, value, height = 120, ...props}: HtmlEditorProps) => {
  const editor = useRef(null);
  const {darkMode} = useContext(AuthContext);
  const [content, setContent] = useState(value);
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || 'Escribe algo...',
      theme: darkMode ? 'dark' : 'light',
      toolbarButtonSize: 'small',
      statusbar: false,
      height: height,
    }),
    [placeholder, darkMode, height]
  );

  return (
    <JoditEditor
      ref={editor}
      value={content}
      // @ts-ignore
      config={config}
      tabIndex={1} // tabIndex of textarea
      onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
      {...props}
    />
  );
};

export default HtmlEditor;
