import React from 'react';
import {
  BtnBold,
  BtnBulletList, BtnClearFormatting,
  BtnItalic, BtnLink,
  BtnNumberedList, BtnStyles,
  BtnUnderline,
  DefaultEditor,
  Toolbar,
  HtmlButton
} from "react-simple-wysiwyg";

interface HtmlEditorProps {
  title?: string;
  value?: string;
  height?: number;
}

const HtmlEditor = ({height = 100, ...props}:HtmlEditorProps) => {
  return (
      <DefaultEditor {...props} style={{height: height}}>
        <Toolbar>
          <BtnStyles style={{color:'#000000', marginLeft:'3px'}} />
          <BtnBold/>
          <BtnItalic />
          <BtnUnderline />
          <BtnBulletList/>
          <BtnNumberedList/>
          <BtnLink />
          <BtnClearFormatting />
          <HtmlButton/>
        </Toolbar>
      </DefaultEditor>
  );
};

export default HtmlEditor;
