import {type ReactNode, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useForm} from 'antd/lib/form/Form';
import {PiCaretDown, PiCaretUp} from 'react-icons/pi';
import {Button, Form} from 'antd';

import PrimaryButton from '../PrimaryButton';
import {TbFilter} from "react-icons/tb";
import './styles.less';

interface FilterFormProps {
  children?: ReactNode;
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
    console.log('check params');
    if (searchParams) {
      console.log('change params', searchParams);
      const newInitial: any = {};
      for (const value of searchParams.keys()) {
        newInitial[value] = searchParams.get(value);
      }
      setInitialValues({...newInitial});
    }
  }, []);

  useEffect(() => {
    console.log('reset form')
    form.resetFields();
    if (onInitialValues) {
      onInitialValues(initialValues);
    }
  }, [initialValues]);

  const onSubmitHandler = (values: any) => {
    console.log('submit', values);
    const o = Object.fromEntries(
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
    console.log(url.toString());
    history.pushState(null, '', url);
    if (onSubmit) {
      onSubmit({...values});
    }
    setLoading(false);
  };

  const onFieldsChange = () => {
    console.log({liveUpdate})
    if (liveUpdate) {
      setLoading(true);
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        form.submit();
      }, 300);
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
          <PrimaryButton loading={loading} icon={<TbFilter/>} label={'Filtrar'} htmlType={'submit'}/>
        </Form>
      )}
      <Button className={'filter-toggle'} size={'small'} block type={'text'} onClick={() => setOpen(!open)}>
        {open ? 'Ocultar filtros' : 'Mostrar filtros'}
        {open ? <PiCaretUp size={16}/> : <PiCaretDown size={16}/>}
      </Button>
    </div>
  );
};

export default FilterForm;
