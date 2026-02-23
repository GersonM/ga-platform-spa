import {useEffect, useState} from 'react';
import {Select, Tag} from 'antd';
import axios from 'axios';

import type {Contract} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CustomTag from "../../../CommonUI/CustomTag";

interface ContractTemplateSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  refresh?: boolean;
  style?: any;
  defaultValue?: string;
  value?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const ContractTemplateSelector = ({placeholder, mode, refresh, ...props}: ContractTemplateSelectorProps) => {
  const [campaign, setCampaign] = useState<Contract[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {is_template: true},
    };

    axios
      .get(`commercial/contracts`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCampaign(
            response.data.map((item: Contract) => {
              return {
                value: item.uuid,
                entity: item,
                label: <>{item.title} <CustomTag>{item.items?.length} valores</CustomTag></>,
              };
            }),
          );
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [refresh]);

  return (
    <Select
      {...props}
      allowClear
      popupMatchSelectWidth={false}
      placeholder={placeholder || 'Elige una plantilla'}
      showSearch={true}
      optionFilterProp={'label'}
      loading={loading}
      options={campaign}
      optionRender={(option: any) => (
        <>{option.label}
          <small>{option.data.entity?.observations}</small>
        </>
      )}
      mode={mode || undefined}
    />
  );
};

export default ContractTemplateSelector;
