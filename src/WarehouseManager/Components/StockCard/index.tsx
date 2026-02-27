import React, {useEffect, useState} from 'react';
import {Button, Col, Row, Space, Tooltip} from "antd";

import {TbCalendarDot, TbEye, TbShare, TbX} from "react-icons/tb";
import pluralize from "pluralize";
import dayjs from "dayjs";
import axios from "axios";

import type {Contract, StorageStock} from "../../../Types/api.tsx";
import MoneyString from "../../../CommonUI/MoneyString";
import StockStatus from "../ProductStockManager/StockStatus.tsx";
import CustomTag from "../../../CommonUI/CustomTag";
import ProviderChip from '../../../Commercial/Components/ProviderChip';
import useAttributeIcon from "../../Hooks/useAttributeIcon.tsx";
import noImage from '../../../Assets/no-image.webp';
import './styles.less';

interface StockCardProps {
  stock: StorageStock;
  onDetails?: () => void;
  onShare?: () => void;
  onClose?: () => void;
}

const StockCard = ({stock, onDetails, onShare, onClose}: StockCardProps) => {
  const {getIcon} = useAttributeIcon();
  const [loading, setLoading] = useState(false);
  const [contractsRelated, setContractsRelated] = useState<Contract[]>();

  useEffect(() => {
    if (stock.status != 'sold' && stock.status != 'reserved') {
      setContractsRelated(undefined);
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {stock_uuid: stock.uuid},
    };

    setLoading(true);

    axios
      .get(`commercial/contracts`, config)
      .then(response => {
        if (response) {
          setContractsRelated(response.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return cancelTokenSource.cancel;
  }, [stock]);

  const address = stock.attributes?.filter(a => a.field.code == 'direccion');
  const secondaryAddress = stock.attributes?.filter(a => a.field.code == 'manzana' || a.field.code == 'lote').map(a => a.field.name + ' ' + a.value) || [];
  const filteredAttributes = stock.attributes?.filter(a => {
    return a.field.code != 'direccion' && a.field.type == 'number' && a.value != '';
  });

  return (
    <div className={'stock-card-container'}>
      {onClose && <div className={'close-button'} onClick={onClose}>
        <TbX size={20}/>
      </div>}
      <div
        className={`image-container ${stock.attachments?.length ? '' : 'no-image'}`}
        style={stock.attachments?.length ? {backgroundImage: `url(${stock.attachments[0].thumbnail})`} : {backgroundImage: `url(${noImage})`}}>
        <Space>
          <StockStatus status={stock.status}/> {stock.sale_price === null && <CustomTag color={'red'}>Sin precio</CustomTag>}
          <CustomTag>
            {stock.type_label}
          </CustomTag>
        </Space>
        <div className={'price'}>
          {stock.sale_price != null ? <MoneyString value={stock.sale_price} currency={stock.currency}/> : 'Sin precio de venta'}
          <small>{dayjs(stock.created_at).fromNow()}</small>
        </div>
      </div>
      <div className="info-container">
        <h3>{stock.full_name}</h3>
        <p>{address?.length ? address?.map((attribute, index) => {
          return attribute.value + ', ';
        }) : ''} {secondaryAddress.join(' ')}
          <small>{stock.warehouse?.name}</small>
        </p>
        <p className="excerpt">
          {stock.excerpt_plain}
        </p>
        <div className={'attributes'}>
          {filteredAttributes?.length == 0 && <small>No hay atributos adicionales</small>}
          {filteredAttributes?.map((attribute, index) => {
            return <Tooltip title={attribute.field.name} key={index}>
              <div className={'attr'}>
                {getIcon(attribute.field.code)}
                {(attribute.field.type == 'number' && attribute.field.unit_type != 'm2' && attribute.field.unit_type != 'm' && attribute.field.unit_type != 'S/') ?
                  <>{pluralize(attribute.field.unit_type, parseInt(attribute.value), true)}</> :
                  <>{attribute.value} {attribute.field.unit_type}</>}
              </div>
            </Tooltip>;
          })}
        </div>
        {
          contractsRelated?.map((contract: Contract, index: number) => {
            return <div className={'sold-information'}>
              <h4>Informacion de venta</h4>
              <div className={'sold-information-item'}>
                <small>Contrato</small>
                <p>{contract.tracking_id}</p>
              </div>
              <div className={'sold-information-item'}>
                <small>Fecha de compra</small>
                <p>{dayjs(contract.approved_at || contract.created_at).format('DD/MM/YYYY')}</p>
              </div>
              <div className={'sold-information-item'}>
                <small>Cliente</small>
                <p>{contract.client?.entity.name}</p>
              </div>
            </div>;
          })
        }
      </div>
      <div className="info-actions">
        <p>Agente: <ProviderChip providerUuid={stock.provider_uuid}/></p>
        <Row gutter={[10, 10]}>
          {onDetails &&
            <Col xs={24}>
              <Button icon={<TbEye/>} block onClick={onDetails}>
                Ver detalles
              </Button>
            </Col>
          }
          <Col xs={12}><Button icon={<TbCalendarDot/>} block disabled>Agendar</Button></Col>
          {onShare &&
            <Col xs={12}>
              <Button icon={<TbShare/>} block onClick={onShare}>Compartir</Button>
            </Col>
          }
        </Row>
      </div>
    </div>
  );
};

export default StockCard;
