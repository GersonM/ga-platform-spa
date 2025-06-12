import {type ReactNode, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useForm} from 'antd/lib/form/Form';
import {PiCaretDown, PiCaretUp} from 'react-icons/pi';
import {TbFilter} from "react-icons/tb";
import {Button, Form} from 'antd';

import PrimaryButton from '../PrimaryButton';
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
    if (searchParams) {
      const newInitial: any = {};
      let hasValues = false;
      for (const value of searchParams.keys()) {
        newInitial[value] = searchParams.get(value);
        hasValues = true;
      }
      if (hasValues) {
        setInitialValues({...newInitial});
      }
    }
  }, []);

  useEffect(() => {
    form.resetFields();
    if (onInitialValues && initialValues) {
      onInitialValues(initialValues);
    }
  }, [initialValues]);

  const onSubmitHandler = (values: any) => {
    const url = new URL(window.location.href);
    Object.keys(values).forEach(k => {
      if (values[k]) {
        url.searchParams.set(k, values[k]);
      } else {
        url.searchParams.delete(k);
      }
    });
    history.pushState(null, '', url);
    if (onSubmit) {
      onSubmit({...values});
    }
    setLoading(false);
  };

  const onFieldsChange = () => {
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
