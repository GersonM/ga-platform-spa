import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useForm} from 'antd/lib/form/Form';
import {PiCaretDown, PiCaretUp, PiFunnelBold} from 'react-icons/pi';
import {Button, Form} from 'antd';

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
  const [open, setOpen] = useState(true);

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
      {open && (
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
      )}
      <Button size={'small'} block type={'text'} onClick={() => setOpen(!open)}>
        {open ? 'Ocultar filtros' : 'Mostrar filtros'}
        {open ? <PiCaretUp size={16} /> : <PiCaretDown size={16} />}
      </Button>
    </div>
  );
};

export default FilterForm;
