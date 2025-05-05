import React, {useEffect, useState} from 'react';
import {PiSignIn, PiSignOut} from 'react-icons/pi';
import {DatePicker, Form, Pagination, Select, Table} from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ProfileChip from '../../../CommonUI/ProfileTools/ProfileChip';
import FilterForm from '../../../CommonUI/FilterForm';
import SearchProfile from '../../../CommonUI/SearchProfile';
import {ResponsePagination} from '../../../Types/api';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [filters, setFilters] = useState<any>();
  const [pagination, setPagination] = useState<ResponsePagination>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        ...filters,
        date: filters?.date ? filters.date.format('YYYY-MM-DD') : null,
        page: currentPage,
        page_size: pageSize,
      },
    };

    setLoading(true);

    axios
      .get(`attendances`, config)
      .then(response => {
        if (response) {
          setAttendance(response.data.data);
          setPagination(response.data.meta);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [reload, filters, pageSize, currentPage]);

  const columns: any[] = [
    {
      title: 'Acción',
      dataIndex: 'action',
      width: 60,
      fixed: 'left',
      align: 'center',
      render: (action: any) => {
        return action == 'enter' ? <PiSignIn size={22} color={'#009800'} /> : <PiSignOut size={22} color={'#ff0000'} />;
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      render: (date: any) => {
        return (
          <>
            {dayjs(date).fromNow()} <br />
            <small>{dayjs(date).format('DD [de] MMMM [del] YYYY hh:mm a')}</small>
          </>
        );
      },
    },
    {
      title: 'Nombre',
      dataIndex: 'profile',
      width: 240,
      render: (area: any) => {
        return <ProfileChip profile={area} />;
      },
    },
    {
      title: 'Autorizado por',
      width: 240,
      dataIndex: 'authorized_by',
      render: (area: any) => {
        return <ProfileChip profile={area} />;
      },
    },
    {
      title: 'Lugar',
      dataIndex: 'area',
      render: (area: any) => {
        return area?.name;
      },
    },
  ];
  return (
    <ModuleContent>
      <ContentHeader title={'Asistencia'} onRefresh={() => setReload(!reload)} loading={loading} />
      <FilterForm
        onSubmit={values => {
          if (values) {
            setFilters(values);
          }
        }}>
        <Form.Item name={'date'} label={'Fecha'}>
          <DatePicker />
        </Form.Item>
        <Form.Item name={'profile_uuid'} label={'Persona'}>
          <SearchProfile />
        </Form.Item>
        <Form.Item name={'action'} label={'Acción'}>
          <Select
            allowClear
            placeholder={'Todas'}
            options={[
              {label: 'Entrada', value: 'enter'},
              {label: 'Salidas', value: 'exit'},
            ]}
          />
        </Form.Item>
      </FilterForm>
      <Table
        rowKey={'uuid'}
        pagination={false}
        loading={loading}
        size={'small'}
        style={{marginTop: 15}}
        scroll={{x: 900}}
        columns={columns}
        dataSource={attendance}
      />
      {pagination && (
        <Pagination
          size="small"
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          total={pagination.total}
          current={pagination.current_page}
          pageSize={pagination.per_page}
        />
      )}
    </ModuleContent>
  );
};

export default AttendanceManagement;
