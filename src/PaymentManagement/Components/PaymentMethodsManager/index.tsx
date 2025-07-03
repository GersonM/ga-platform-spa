import React, {useEffect, useState} from 'react';
import axios from "axios";
import dayjs from "dayjs";
import {
  TbBrandPaypal,
  TbCreditCard,
  TbPencil,
  TbStarFilled,
  TbTrash, TbWallet
} from "react-icons/tb";
import {Space} from "antd";

import ErrorHandler from "../../../Utils/ErrorHandler.tsx";
import type {PaymentMethod} from "../../../Types/api.tsx";
import TableList from "../../../CommonUI/TableList";
import PrimaryButton from "../../../CommonUI/PrimaryButton";
import ModalView from "../../../CommonUI/ModalView";
import PaymentMethodForm from "../PaymentMethodForm";
import IconButton from "../../../CommonUI/IconButton";

interface PaymentMethodsManagerProps {
  profileUuid: string;
}

const PaymentMethodsManager = ({profileUuid}: PaymentMethodsManagerProps) => {
  const [methods, setMethods] = useState<PaymentMethod[]>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [openMethodsForm, setOpenMethodsForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>()

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {profile_uuid: profileUuid},
    };
    setLoading(true);
    axios
      .get(`payment-management/payment-methods`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setMethods(response.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, profileUuid]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
    },
    {
      title: 'Tipo',
      align: 'center',
      dataIndex: 'type',
      render: (type:string) => {
        switch (type) {
          case 'Niubiz':
          case 'card':
            return <TbCreditCard size={25} />
          case 'payu':
            return <TbWallet size={25} />
          case 'paypal':
            return <TbBrandPaypal size={25} />
          default:
            return type;
        }
      }
    },
    {
      title: 'Entidad',
      dataIndex: 'issuer',
    },
    {
      title: 'Número',
      dataIndex: 'number',
    },
    {
      title: 'Por defecto',
      dataIndex: 'is_default',
      render: (is_default: boolean) => {
        return (is_default && <TbStarFilled/>);
      },
    },
    {
      title: 'Fecha de expiración',
      dataIndex: 'expire_date',
      render: (expire_date: string) => expire_date ? dayjs(expire_date).format('DD/MM/YYYY HH:mm:ss') : 'No definido',
    },
    {
      title: 'Creado',
      dataIndex: 'created_at',
      render: (created_at: string) => dayjs(created_at).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      dataIndex: 'uuid',
      render: (uuid: string, row: any) => {
        return <Space>
          <IconButton icon={<TbPencil/>} onClick={() => {
            setSelectedMethod(row);
            setOpenMethodsForm(true);
          }}/>
          <IconButton icon={<TbTrash />} danger/>
        </Space>
      }
    }
  ];

  return (
    <div>
      <TableList columns={columns} dataSource={methods} loading={loading}/>
      <PrimaryButton label={'Agregar nuevo método de pago'} onClick={() => setOpenMethodsForm(true)}/>
      <ModalView onCancel={() => {
        setOpenMethodsForm(false);
        setSelectedMethod(undefined);
      }} open={openMethodsForm}>
        <PaymentMethodForm paymentMethod={selectedMethod} profileUuid={profileUuid} onComplete={() => {
          setOpenMethodsForm(false);
          setSelectedMethod(undefined);
          setReload(!reload);
        }}/>
      </ModalView>
    </div>
  );
};

export default PaymentMethodsManager;
