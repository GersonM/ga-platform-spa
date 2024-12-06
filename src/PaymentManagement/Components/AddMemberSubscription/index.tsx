import React, {useState} from 'react';
import {Form, Select} from 'antd';
import axios from 'axios';

import ProfileSelector from '../../../CommonUI/ProfileSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Subscription} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';

interface AddMemberSubscriptionProps {
  subscription: Subscription;
  onComplete?: () => void;
}

const AddMemberSubscription = ({subscription, onComplete}: AddMemberSubscriptionProps) => {
  const [loading, setLoading] = useState(false);

  const checkSubscriptions = (value: string) => {
    console.log(value);
  };

  const submitForm = (values: any) => {
    setLoading(true);
    axios
      .post('subscriptions/members', {...values, subscription_uuid: subscription.uuid})
      .then(res => {
        setLoading(false);
        onComplete && onComplete();
      })
      .catch(err => {
        setLoading(false);
        ErrorHandler.showNotification(err);
      });
  };

  return (
    <div>
      <Form onFinish={submitForm} layout={'vertical'}>
        <Form.Item label={'Nuevo miembro'} name={'profile_uuid'}>
          <ProfileSelector onChange={checkSubscriptions} />
        </Form.Item>
        <Form.Item label={'Parentesco'} name={'relation'}>
          <Select
            showSearch
            options={[
              {label: 'Hijo', value: 'HIJO'},
              {label: 'Hija', value: 'HIJA'},
              {label: 'Tía', value: 'TIA'},
              {label: 'Sobrino', value: 'SOBRINO'},
              {label: 'Cónyuge', value: 'CÓNYUGE'},
              {label: 'Hermano', value: 'HERMANO'},
              {label: 'Papá', value: 'PAPÁ'},
              {label: 'Mamá', value: 'MAMÁ'},
              {label: 'Nieto', value: 'NIETO'},
              {label: 'Nieta', value: 'NIETA'},
              {label: 'Yerno', value: 'YERNO'},
              {label: 'Cuñado', value: 'CUÑADO'},
              {label: 'Suegro', value: 'SUEGRO'},
              {label: 'Suegra', value: 'SUEGRA'},
              {label: 'Otro', value: 'OTRO'},
            ]}
          />
        </Form.Item>
        <PrimaryButton loading={loading} htmlType={'submit'} label={'Enviar'} block />
      </Form>
    </div>
  );
};

export default AddMemberSubscription;
