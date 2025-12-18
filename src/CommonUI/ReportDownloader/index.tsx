import React, {useState} from 'react';
import axios from "axios";
import dayjs from "dayjs";
import ErrorHandler from "../../Utils/ErrorHandler.tsx";
import PrimaryButton from "../PrimaryButton";
import {RiFileExcel2Fill} from "react-icons/ri";
import {Tooltip} from "antd";

interface ReportDownloaderProps {
  params?:any;
  url:string;
  label?:string;
  method?:string;
}

const ReportDownloader = ({url, label, params, method='GET'}:ReportDownloaderProps) => {
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
      method: 'GET',
      responseType: 'blob',
    })
      .then(response => {
        setDownloading(false);
        if (response) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'ventas_' + dayjs().format('D-M-YYYY') + '.xlsx';
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
        icon={<RiFileExcel2Fill size={18}/>}
        onClick={getFile}
        size={'small'}
        loading={downloading}
        label={'Exportar'}
      />
    </Tooltip>
  );
};

export default ReportDownloader;
