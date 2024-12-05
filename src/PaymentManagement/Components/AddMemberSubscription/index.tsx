import React, {useState} from 'react';
import {Form, Input, Select} from 'antd';

import ProfileSelector from '../../../CommonUI/ProfileSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import axios from 'axios';
import {Subscription} from '../../../Types/api';

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
    axios
      .post('subscriptions/members', {...values, subscription_uuid: subscription.uuid})
      .then(res => {
        onComplete && onComplete();
      })
      .catch(err => {});
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
