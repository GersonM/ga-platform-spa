import React, {useEffect, useState} from 'react';
import {Checkbox, Col, Collapse, Form, Input, List, Modal, Row, Space} from 'antd';
import {useParams} from 'react-router-dom';
import {useForm} from 'antd/lib/form/Form';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CourseForm from '../../Components/CourseForm';
import TaxonomySelector from '../../../TaxonomyManagement/Components/TaxonomySelector';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import {Course} from '../../../Types/api';
import {PlusIcon} from '@heroicons/react/24/solid';

const CourseDetail = () => {
  const [course, setCourse] = useState<Course>();
  const [loading, setLoading] = useState(false);
  const [openCourseForm, setOpenCourseForm] = useState(false);
  const [reload, setReload] = useState(false);
  const params = useParams();
  const [form] = useForm();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    axios
      .get(`/lms/courses/${params.course}`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCourse(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [course, form]);

  const submitForm = (values: any) => {
    axios
      .put(`/lms/courses/${params.course}`, values)
      .then(response => {
        setCourse(response.data);
      })
      .catch(error => {
        ErrorHandler.showNotification(error);
      });
  };

  return (
    <ModuleContent>
      <ContentHeader
        showBack
        loading={loading}
        title={'Cursos'}
        onAdd={() => setOpenCourseForm(true)}
        onRefresh={() => setReload(!reload)}
      />
      <Row gutter={[20, 20]}>
        <Col span={12}>
          <h3>Información del curso</h3>
          <Form form={form} layout="vertical" onFinish={submitForm} initialValues={course}>
            <Form.Item name={'name'} label={'Nombre del curso'}>
              <Input />
            </Form.Item>
            <Form.Item name={'category'} label={'Categoría y etiquetas'} extra={'Usa valores separados por comas'}>
              <Input />
            </Form.Item>
            <Form.Item name={'description'} label={'Descripción'}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item name={'benefits'} label={'Beneficios'}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item name={'is_public'} label={'Estado de publicación'}>
              <Checkbox>Publicar</Checkbox>
            </Form.Item>
            <Form.Item name={'taxonomy_uuid'} label={'Estado de publicación'}>
              <TaxonomySelector />
            </Form.Item>
            <PrimaryButton htmlType={'submit'} label={'Guardar'} block />
          </Form>
        </Col>
        <Col span={12}>
          <Space style={{marginBottom: 10}}>
            <h3>Lista de sesiones</h3>
            <PrimaryButton icon={<PlusIcon />} label={'Nuevo modulo'} ghost size={'small'} />
          </Space>
          <Collapse size={'small'}>
            <Collapse.Panel key={'c1'} header={'Modulo 1'}>
              <List size={'small'}>
                <List.Item>Sesión 1</List.Item>
                <List.Item>Sesión 2</List.Item>
              </List>
              <PrimaryButton label={'Agregar sesión'} ghost size={'small'} />
            </Collapse.Panel>
            <Collapse.Panel key={'c1'} header={'Modulo 2'}>
              <List size={'small'}>
                <List.Item>Sesión 1</List.Item>
                <List.Item>Sesión 2</List.Item>
              </List>
              <PrimaryButton label={'Agregar sesión'} ghost size={'small'} />
            </Collapse.Panel>
          </Collapse>
        </Col>
      </Row>
      <Modal
        destroyOnClose
        title={'Crear curso'}
        open={openCourseForm}
        onCancel={() => setOpenCourseForm(false)}
        footer={false}>
        <CourseForm
          onComplete={() => {
            setOpenCourseForm(false);
            setReload(!reload);
          }}
        />
      </Modal>
    </ModuleContent>
  );
};

export default CourseDetail;
