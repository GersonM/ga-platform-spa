import {useEffect, useState} from 'react';
import {TrashIcon} from '@heroicons/react/24/solid';
import {Modal, Popconfirm, Space} from 'antd';
import {useNavigate} from 'react-router-dom';
import {PiPencil} from 'react-icons/pi';
import axios from 'axios';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import TableList from '../../../CommonUI/TableList';
import ErrorHandler from '../../../Utils/ErrorHandler';
import CourseForm from '../../Components/CourseForm';
import IconButton from '../../../CommonUI/IconButton';
import type {Course} from '../../../Types/api';

const CoursesManagement = () => {
  const [courses, setCourses] = useState<Course[]>();
  const [loading, setLoading] = useState(false);
  const [openCourseForm, setOpenCourseForm] = useState(false);
  const [reload, setReload] = useState(false);
  const navigate = useNavigate();

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

  const deleteCourse = (uuid: string) => {
    setLoading(true);
    axios
      .delete(`/lms/courses/${uuid}`)
      .then(() => {
        setLoading(false);
        setReload(!reload);
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'brief',
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
            <IconButton icon={<PiPencil size={19} />} onClick={() => navigate(`/lms/courses/${uuid}`)} />
            <Popconfirm title={'¿Quieres eliminar?'} onConfirm={() => deleteCourse(uuid)}>
              <IconButton danger icon={<TrashIcon />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <ModuleContent>
      <ContentHeader
        loading={loading}
        title={'Cursos'}
        onAdd={() => setOpenCourseForm(true)}
        onRefresh={() => setReload(!reload)}
      />
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
