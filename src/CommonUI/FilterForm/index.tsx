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

const FilterForm = ({children, onInitialValues, onSubmit, liveUpdate = true}: FilterFormProps) => {
  const [searchParams] = useSearchParams();
  const [initialValues, setInitialValues] = useState<any>();
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
    console.log({initialValues});
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
    onSubmit && onSubmit(o);
  };

  const onFieldsChange = () => {
    if (liveUpdate) {
      form.submit();
    }
  };

  return (
    <div className={'filter-form-container'}>
      <Form
        form={form}
        onFieldsChange={onFieldsChange}
        initialValues={initialValues}
        onFinish={onSubmitHandler}
        variant={'filled'}
        layout={'inline'}>
        {children}
        <PrimaryButton icon={<PiFunnelBold size={18} />} label={'Filtrar'} htmlType={'submit'} />
      </Form>
    </div>
  );
};

export default FilterForm;
