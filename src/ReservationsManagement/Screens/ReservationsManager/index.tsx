import {useEffect, useMemo, useState} from 'react';
import {Button, Collapse, DatePicker, Empty, Form, Input, Modal, Popover, Select, Space} from 'antd';
import {PiStampBold} from 'react-icons/pi';
import axios from 'axios';
import dayjs, {Dayjs} from 'dayjs';
import {BiPrinter, BiSave} from 'react-icons/bi';

import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import ErrorHandler from '../../../Utils/ErrorHandler';
import type {MoveTrip} from '../../../Types/api';
import RouteSelector from '../../Components/RouteSelector';
import LoadingIndicator from '../../../CommonUI/LoadingIndicator';
import TripStatus from '../../Components/TripStatus';
import VehicleSelector from '../../../MoveManagement/Components/VehicleSelector';
import ReservationAttendanceManager from '../../Components/ReservationAttendanceManager';
import EstateContractAddress from '../../../Commercial/Components/RealState/EstateContractAddress';
import ReservationForm from '../../Components/ReservationForm';
import PrimaryButton from '../../../CommonUI/PrimaryButton';
import LoadTripsTemplate from '../../Components/LoadTripsTemplate';
import Config from '../../../Config';
import PrintContractsDocuments from '../../Components/PrintContractsDocuments';
import './styles.less';
import FilterForm from "../../../CommonUI/FilterForm";

const ReservationsManager = () => {
  const [openTripModal, setOpenTripModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs|null>();
  const [selectedRouteUuid, setSelectedRouteUuid] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [trips, setTrips] = useState<MoveTrip[]>();
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>();
  const [openLoadTemplate, setOpenLoadTemplate] = useState(false);
  const [openPrintDocuments, setOpenPrintDocuments] = useState(false);
  const [openCreateTemplate, setOpenCreateTemplate] = useState(false);
  const [selectedDateForTemplate, setSelectedDateForTemplate] = useState<Dayjs>();
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        date: selectedDate?.format('YYYY-MM-DD'),
        route_uuid: selectedRouteUuid,
        vehicle_uuid: selectedVehicle,
        status: selectedStatus,
      },
    };
    setLoading(true);
    axios
      .get(`move/trips`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setTrips(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, selectedDate, selectedRouteUuid, selectedStatus, selectedVehicle]);

  const groupedTrips = useMemo(() => {
    const groups: any = {};
    trips?.forEach(t => {
      const dateKey: string = dayjs(t.departure_time).format('YYYY_MM_DD');
      if (!groups[dateKey]) {
        groups[dateKey] = {date: dayjs(t.departure_time), trips: []};
      }
      groups[dateKey].trips.push(t);
    });
    return groups;
  }, [trips]);

  const saveTemplate = (values: any) => {
    setSavingTemplate(true);
    axios
      .post('move/templates', values)
      .then(() => {
        setSavingTemplate(false);
        setOpenCreateTemplate(false);
      })
      .catch(e => {
        setSavingTemplate(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <>
      <ContentHeader
        title={'Reservas'}
        loading={loading}
        tools={
          <>
            <PrimaryButton
              label={'Cargar plantilla'}
              icon={<PiStampBold size={16} />}
              onClick={() => setOpenLoadTemplate(true)}
              ghost
              size={'small'}
            />
          </>
        }
        onRefresh={() => setReload(!reload)}
        onAdd={() => setOpenTripModal(true)}>
        <FilterForm>
          <Form.Item label={'Fecha'}>
            <DatePicker style={{width: 130}} onChange={val => setSelectedDate(val)} />
          </Form.Item>
          <VehicleSelector placeholder={'Equipo'} style={{width: 190}} onChange={value => setSelectedVehicle(value)} />
          <RouteSelector
            placeholder={'Tipo'}
            style={{width: 190}}
            onChange={value => {
              setSelectedRouteUuid(value);
            }}
          />
          <Select
            style={{width: 120}}
            onChange={val => setSelectedStatus(val)}
            placeholder={'Estado'}
            allowClear
            options={[
              {label: 'Pendientes', value: 'pending'},
              {label: 'Completados', value: 'completed'},
              {label: 'Cancelados', value: 'canceled'},
              {label: 'Confirmados', value: 'confirmed'},
            ]}
          />
        </FilterForm>
      </ContentHeader>
      <LoadingIndicator visible={loading} fitBox={false} message={'Listando reservas...'} />
      {trips && trips.length === 0 && (
        <Empty description={'No hay reservas programadas'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
      {Object.keys(groupedTrips).map(g => {
        return (
          <div key={g}>
            <div className={'reservation-day-divider'}>
              {groupedTrips[g].date.format('dddd DD [de] MMMM - YYYY')}
              <Space>
                <Button
                  size={'small'}
                  ghost
                  type={'link'}
                  icon={<BiSave size={16} />}
                  onClick={() => {
                    setOpenCreateTemplate(true);
                    setSelectedDateForTemplate(groupedTrips[g].date);
                  }}>
                  Guardar como plantilla
                </Button>
                <Button
                  size={'small'}
                  ghost
                  type={'link'}
                  icon={<BiPrinter size={16} />}
                  onClick={() => {
                    setOpenPrintDocuments(true);
                    setSelectedDateForTemplate(groupedTrips[g].date);
                  }}>
                  Imprimir documentos
                </Button>
              </Space>
            </div>
            <Collapse
              destroyOnHidden
              items={groupedTrips[g].trips?.map((trip: MoveTrip) => {
                return {
                  extra: (
                    <Popover
                      content={
                        <>
                          Reservado por: {trip.created_by?.name} {trip.created_by?.last_name} | {trip.total_passengers}{' '}
                          de {trip.vehicle?.max_capacity}
                        </>
                      }>
                      <div className={'reservation-tab-label'}>
                        {trip.route?.name} <br />
                        <TripStatus trip={trip} />
                      </div>
                    </Popover>
                  ),
                  label: (
                    <div className={'reservation-tab'}>
                      <div className={'departure-time'}>
                        {dayjs(trip.departure_time).format('hh:mm')} <br />
                        <span>{dayjs(trip.departure_time).format('A')}</span>
                      </div>
                      <Space wrap>
                        {trip.contracts?.map((c, index) => {
                          return <EstateContractAddress key={index} contract={c} />;
                        })}
                      </Space>
                    </div>
                  ),
                  key: trip.uuid,
                  children: <ReservationAttendanceManager onChange={() => setReload(!reload)} trip={trip} />,
                };
              })}
            />
          </div>
        );
      })}

      <Modal
        title={'Nueva reservas'}
        footer={false}
        open={openTripModal}
        destroyOnHidden
        onCancel={() => {
          setOpenTripModal(false);
        }}>
        <ReservationForm
          onCompleted={() => {
            setReload(!reload);
            setOpenTripModal(false);
          }}
        />
      </Modal>
      <Modal
        title={'Cargar plantilla'}
        footer={false}
        open={openLoadTemplate}
        destroyOnHidden
        onCancel={() => {
          setOpenLoadTemplate(false);
        }}>
        <LoadTripsTemplate
          onCompleted={() => {
            setOpenLoadTemplate(false);
            setReload(!reload);
          }}
        />
      </Modal>
      <Modal
        title={'Imprimir documentos'}
        width={700}
        footer={false}
        open={openPrintDocuments}
        destroyOnHidden
        onCancel={() => {
          setOpenPrintDocuments(false);
        }}>
        <PrintContractsDocuments date={selectedDateForTemplate} />
      </Modal>
      <Modal
        title={'Crear plantilla'}
        footer={false}
        open={openCreateTemplate}
        destroyOnHidden
        onCancel={() => {
          setOpenCreateTemplate(false);
        }}>
        <Form
          layout="vertical"
          onFinish={saveTemplate}
          initialValues={{date: selectedDateForTemplate?.format(Config.dateFormatServer)}}>
          <p>
            La programación del {selectedDateForTemplate?.format(Config.dateFormatServer)} estará disponible para ser
            usado como plantilla para otros días.
          </p>
          <Form.Item name={'date'} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={'name'}>
            <Input placeholder={'Nombre de la plantilla'} />
          </Form.Item>
          <PrimaryButton loading={savingTemplate} block htmlType={'submit'} label={'Guardar'} />
        </Form>
      </Modal>
    </>
  );
};

export default ReservationsManager;
