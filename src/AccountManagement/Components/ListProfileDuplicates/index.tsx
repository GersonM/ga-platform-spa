import axios from "axios";
import React, {useEffect, useState} from 'react';
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import {Collapse} from "antd";
import CustomTag from "../../../CommonUI/CustomTag";

const ListProfileDuplicates = () => {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<any>();
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);

    axios
      .get(`hr-management/profiles/duplicates`, config)
      .then(response => {
        if (response) {
          setDuplicates(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload]);
  return (
    <div>
      <LoadingIndicator visible={loading}/>
      <h2>Perfiles duplicados</h2>
      <p>Estos son los perfiles que tienen datos duplicados en orden de prioridad</p>
      <Collapse
        size={'small'}
        items={[
          {
            label: 'DNI',
            extra: <CustomTag color={'red'}>Crítico ({duplicates?.doc_number.length})</CustomTag>,
            children: (<>
              {duplicates?.doc_number.map((d: any) => {
                return <p key={d.value}>{d.value} - {d.total} duplicados</p>
              })}
            </>)
          },
          {
            label: 'E-mail corporativo',
            extra: <CustomTag color={'orange'}>Medio ({duplicates?.email.length})</CustomTag>,
            children: (<>
              {duplicates?.email.map((d: any) => {
                return <p key={d.value}>{d.value} - {d.total} duplicados</p>
              })}
            </>)
          },
          {
            label: 'E-mail personal',
            extra: <CustomTag color={'blue'}>Bajo ({duplicates?.personal_email.length})</CustomTag>,
            children: (<>
              {duplicates?.personal_email.map((d: any) => {
                return <p key={d.value}>{d.value} - {d.total} duplicados</p>
              })}
            </>)
          },
        ]}/>
    </div>
  );
};

export default ListProfileDuplicates;
