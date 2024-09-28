import {useEffect, useState} from 'react';
import {Select} from 'antd';
import axios from 'axios';
import {Campaign} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface CampaignSelectorProps {
  placeholder?: string;
  onChange?: (value: any, option: any) => void;
  bordered?: boolean;
  disabled?: boolean;
  style?: any;
  value?: any;
  size?: 'small' | 'large';
  mode?: 'multiple' | 'tags' | undefined;
}

const CampaignSelector = ({placeholder, mode, ...props}: CampaignSelectorProps) => {
  const [campaign, setCampaign] = useState<Campaign | any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`commercial/campaigns`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCampaign(
            response.data.map((item: Campaign) => {
              return {
                value: item.uuid,
                entity: item,
                label: `${item.name}`,
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
  }, []);

  return (
    <Select
      {...props}
      allowClear
      placeholder={placeholder || 'Elige una campaña'}
      showSearch={true}
      optionFilterProp={'label'}
      loading={loading}
      options={campaign}
      mode={mode || undefined}
    />
  );
};

export default CampaignSelector;
