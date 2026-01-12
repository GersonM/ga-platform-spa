import React, {useState} from 'react';
import axios from "axios";
import dayjs from "dayjs";
import {Tooltip} from "antd";
import {RiFileExcel2Fill} from "react-icons/ri";
import ErrorHandler from "../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../PrimaryButton";

interface ReportDownloaderProps {
  params?: any;
  url: string;
  label?: string;
  fileName?: string;
  method?: string;
  fileFormat?: string;
}

const ReportDownloader = (
  {
    url,
    label = 'Descargar',
    params,
    method = 'GET',
    fileName,
    fileFormat = 'xlsx'
  }: ReportDownloaderProps) => {
  const [downloading, setDownloading] = useState(false);

  const getFile = () => {
    const config = {
      responseType: 'blob',
      params,
    };

    setDownloading(true);
    axios({
      url: url,
      params: config.params,
      method,
      responseType: 'blob',
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName + '_' + dayjs().format('D-M-YYYY') + '.' + fileFormat;
          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      })
      .catch(e => {
        setDownloading(false);
        ErrorHandler.showNotification(e);
      });
  };
  return (
    <Tooltip title={'Exportar listado actual en formato excel'}>
      <PrimaryButton
        icon={<RiFileExcel2Fill size={16}/>}
        onClick={getFile}
        size={'small'}
        loading={downloading}
        label={label}
      />
    </Tooltip>
  );
};

export default ReportDownloader;
