import React, {useEffect, useState} from 'react';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Modal} from 'antd';
import CourseForm from '../../Components/CourseForm';

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
      title: 'UUID',
      dataIndex: 'uuid',
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader title={'Cursos'} onAdd={() => setOpenCourseForm(true)} onRefresh={() => setReload(!reload)} />
      <TableList columns={columns} dataSource={courses} />
      <Modal title={'Crear curso'} open={openCourseForm} onCancel={() => setOpenCourseForm(false)} footer={false}>
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
