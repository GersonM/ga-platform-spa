import React, {useEffect, useState} from 'react';
import {Select} from 'antd';
import axios from 'axios';
import {Plan} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import MoneyString from '../../../CommonUI/MoneyString';

const SubscriptionPlanSelector = ({...props}) => {
  const [plans, setPlans] = useState<any>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    axios
      .get(`subscriptions/plans`, config)
      .then(response => {
        if (response) {
          setPlans(
            response.data.map((item: Plan) => {
              return {
                value: item.uuid,
                entity: item,
                label: (
                  <>
                    <div>
                      {item.name} <MoneyString value={item.price} />
                    </div>
                    <small>{item.description}</small>
                  </>
                ),
              };
            }),
          );
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);
  return (
    <Select
      labelRender={label => {
        const p = plans.find((p: any) => p.value === label.value);
        return (
          <div>
            <div
              style={{
                lineHeight: '10px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'block',
                marginTop: '10px',
              }}>
              {p.entity.name} <MoneyString value={p.entity.price} />
            </div>
            <span style={{fontSize: '12px', lineHeight: '12px', opacity: '0.4'}}>{p.entity.description}</span>
          </div>
        );
      }}
      style={{height: 50}}
      placeholder={'Selecciona un plan'}
      options={plans}
      {...props}
    />
  );
};

export default SubscriptionPlanSelector;
