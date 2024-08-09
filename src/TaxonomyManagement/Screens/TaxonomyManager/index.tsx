import React, {useEffect, useState} from 'react';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import axios from 'axios';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CascaderPanel from 'antd/lib/cascader/Panel';

const TaxonomyManager = () => {
  const [taxonomies, setTaxonomies] = useState<any>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`taxonomy/definitions`, config)
      .then(response => {
        if (response) {
          setTaxonomies(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  return (
    <>
      <ContentHeader title={'Taxonomías'} description={'Las taxonomías ayuda a gestionar información'} />
      <CascaderPanel
        fieldNames={{label: 'name', value: 'uuid'}}
        options={taxonomies}
        onChange={val => {
          console.log(val);
        }}
      />
    </>
  );
};

export default TaxonomyManager;
