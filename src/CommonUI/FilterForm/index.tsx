import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useForm} from 'antd/lib/form/Form';
import {PiFunnelBold} from 'react-icons/pi';
import {Form} from 'antd';

import PrimaryButton from '../PrimaryButton';
import './styles.less';

interface FilterFormProps {
  children?: React.ReactNode;
  onInitialValues?: (values: any) => void;
  onSubmit?: (values: any) => void;
  liveUpdate?: boolean;
}

let timer: any = null;

const FilterForm = ({children, onInitialValues, onSubmit, liveUpdate = true}: FilterFormProps) => {
  const [searchParams] = useSearchParams();
  const [initialValues, setInitialValues] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [form] = useForm();

  useEffect(() => {
    if (searchParams) {
      let newInitial: any = {};
      for (const value of searchParams.keys()) {
        if (searchParams.has(value)) {
          newInitial[value] = searchParams.get(value);
        }
        setInitialValues({...newInitial});
      }
    }
  }, [searchParams]);

  useEffect(() => {
    form.resetFields();
    onInitialValues && onInitialValues(initialValues);
  }, [initialValues]);

  const onSubmitHandler = (values: any) => {
    let o = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => {
        return v != null;
      }),
    );
    const url = new URL(window.location.href);
    Object.keys(values).forEach(k => {
      if (values[k]) {
        url.searchParams.set(k, values[k]);
      } else {
        url.searchParams.delete(k);
      }
    });
    history.pushState(null, '', url);
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      onSubmit && onSubmit(o);
      setLoading(false);
    }, 300);
  };

  const onFieldsChange = () => {
    if (liveUpdate) {
      setLoading(true);
      form.submit();
    }
  };

  return (
    <div className={'filter-form-container'}>
      <Form
        form={form}
        size={'small'}
        onFieldsChange={onFieldsChange}
        initialValues={initialValues}
        onFinish={onSubmitHandler}
        layout={'inline'}>
        {children}
        <PrimaryButton loading={loading} icon={<PiFunnelBold size={16} />} label={'Filtrar'} htmlType={'submit'} />
      </Form>
    </div>
  );
};

export default FilterForm;
