import {useState} from 'react';
import {Form} from 'antd';
import axios from 'axios';

import ProfileSelector from '../../../CommonUI/ProfileSelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Subscription} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import FamilyRelationSelector from '../../../CommonUI/FamilyRelationSelector';

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
      .then(() => {
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
          <FamilyRelationSelector />
        </Form.Item>
        <PrimaryButton loading={loading} htmlType={'submit'} label={'Enviar'} block />
      </Form>
    </div>
  );
};

export default AddMemberSubscription;
