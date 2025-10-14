import {type ReactNode, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useForm} from 'antd/lib/form/Form';
import {PiCaretDown, PiCaretUp} from 'react-icons/pi';
import {TbFilter} from "react-icons/tb";
import {Button, Drawer, Form, Space} from 'antd';

import PrimaryButton from '../PrimaryButton';
import './styles.less';

interface FilterFormProps {
  children?: ReactNode;
  additionalChildren?: ReactNode;
  onInitialValues?: (values: any) => void;
  onSubmit?: (values: any) => void;
  liveUpdate?: boolean;
  updateUrl?: boolean;
}

let timer: any = null;

const FilterForm = ({children, additionalChildren, onInitialValues, onSubmit, liveUpdate = true, updateUrl = true}: FilterFormProps) => {
  const [searchParams] = useSearchParams();
  const [initialValues, setInitialValues] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [form] = useForm();
  const [open, setOpen] = useState(true);
  const [openMoreFilters, setOpenMoreFilters] = useState(false);

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
    if (updateUrl) {
      const url = new URL(window.location.href);
      Object.keys(values).forEach(k => {
        if (values[k]) {
          url.searchParams.set(k, values[k]);
        } else {
          url.searchParams.delete(k);
        }
      });
      history.pushState(null, '', url);
    }
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
        <div className={'form-wrapper'}>
          <Form
            form={form}
            onFieldsChange={onFieldsChange}
            initialValues={initialValues}
            onFinish={onSubmitHandler}
            layout={'inline'}>
            {children}
            <Drawer
              title={'Filtros avanzados'}
              open={openMoreFilters} onClose={() => setOpenMoreFilters(false)}>
              {additionalChildren}
            </Drawer>
            <Space>

            <PrimaryButton className={'primary-button'} loading={loading} icon={<TbFilter/>} label={'Filtrar'}
                           htmlType={'submit'}/>
            <Button type={"link"} onClick={() => setOpenMoreFilters(true)}>
              Más filtros
            </Button>
            </Space>
          </Form>
        </div>
      )}
      <Button className={'filter-toggle'} size={'small'} block type={'text'} onClick={() => setOpen(!open)}>
        {open ? 'Ocultar filtros' : 'Mostrar filtros'}
        {open ? <PiCaretUp size={16}/> : <PiCaretDown size={16}/>}
      </Button>
    </div>
  );
};

export default FilterForm;
