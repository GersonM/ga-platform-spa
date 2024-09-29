import React, {useEffect, useState} from 'react';
import {ArrowRightIcon, TrashIcon} from '@heroicons/react/24/solid';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Modal, Space} from 'antd';
import CourseForm from '../../Components/CourseForm';
import IconButton from '../../../CommonUI/IconButton';

const CoursesManagement = () => {
  const [courses, setCourses] = useState<any[]>();
  const [loading, setLoading] = useState(false);
  const [openCourseForm, setOpenCourseForm] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };

    setLoading(true);
    axios
      .get(`/lms/courses`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setCourses(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
    },
    {
      title: 'Publicado',
      dataIndex: 'is_public',
      render: (is_public: any) => {
        return is_public ? 'Si' : 'No';
      },
    },
    {
      title: 'Categoría',
      dataIndex: 'taxonomy_item',
      render: (item: any) => {
        return item?.definition?.name;
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'uuid',
      width: 120,
      render: (uuid: string) => {
        return (
          <Space>
            <IconButton icon={<ArrowRightIcon />} onClick={() => {}} />
            <IconButton danger icon={<TrashIcon />} onClick={() => {}} />
          </Space>
        );
      },
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Cursos'} onAdd={() => setOpenCourseForm(true)} onRefresh={() => setReload(!reload)} />
      <TableList columns={columns} dataSource={courses} />
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

export default CoursesManagement;
