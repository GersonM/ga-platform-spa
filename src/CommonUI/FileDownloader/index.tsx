import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Space} from "antd";

import ErrorHandler from "../../Utils/ErrorHandler.tsx";
import LoadingIndicator from "../LoadingIndicator";
import ModalView from "../ModalView";
import IconButton from "../IconButton";
import {TbReload} from "react-icons/tb";

interface FileDownloaderProps {
  url: string;
  name?: string;
  open: boolean;
  data?: any;
  onComplete?: () => void;
}

const FileDownloader = ({url, name, open = false, onComplete, data}: FileDownloaderProps) => {
  const [openPrint, setOpenPrint] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [tempURL, setTempURL] = useState<string>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (open) {
      generateDocuments();
    }
  }, [open, reload]);

  const generateDocuments = () => {
    setOpenPrint(true);
    setDownloading(true);
    console.log({data});
    axios({
      url: url,
      method: 'GET',
      responseType: 'blob',
      params: data
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(response.data);
          setTempURL(url);
        }
      })
      .catch(e => {
        setDownloading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <ModalView
      title={<Space>
        {name}
        <IconButton icon={<TbReload/>} onClick={() => setReload(!reload)}/>
      </Space>}
      width={'80%'}
      open={openPrint}
      onCancel={() => {
        setOpenPrint(false);
        setTempURL(undefined);
        if (onComplete) onComplete();
      }}>
      <LoadingIndicator visible={downloading}/>
      {tempURL && <iframe src={tempURL} height={680} width={'100%'} style={{border: "none"}}/>}
    </ModalView>
  );
};

export default FileDownloader;
