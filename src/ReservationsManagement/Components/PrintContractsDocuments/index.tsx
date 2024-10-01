import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {MovePassenger} from '../../../Types/api';
import ErrorHandler from '../../../Utils/ErrorHandler';
import {Dayjs} from 'dayjs';
import Config from '../../../Config';
import {Checkbox, Col, List, Row} from 'antd';
import PrimaryButton from '../../../CommonUI/PrimaryButton';

interface PrintContractsDocumentsProps {
  date?: Dayjs;
}

const PrintContractsDocuments = ({date}: PrintContractsDocumentsProps) => {
  const [passengers, setPassengers] = useState<MovePassenger[]>();
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {date: date?.format(Config.dateFormatServer)},
    };

    axios
      .get(`move/passengers`, config)
      .then(response => {
        if (response) {
          setPassengers(response.data);
        }
      })
      .catch(e => {
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);
  const toggleSelection = (value: string, add: boolean) => {
    const exist = selectedProfiles.indexOf(value);

    if (add) {
      if (exist == -1) {
        setSelectedProfiles([...selectedProfiles, value]);
      }
    } else {
      if (exist != -1) {
        const newItem = [...selectedProfiles];
        newItem.splice(exist, 1);
        setSelectedProfiles(newItem);
      }
    }
  };

  console.log(selectedProfiles);
  return (
    <div>
      <Row gutter={[20, 20]}>
        <Col md={12}>
          <h3>Personas</h3>
          <List>
            {passengers?.map((p, index) => {
              return (
                <List.Item key={index}>
                  <Checkbox onChange={e => toggleSelection(e.target.value, e.target.checked)} value={p.profile?.uuid}>
                    {p.profile?.name} {p.profile?.last_name}
                  </Checkbox>
                </List.Item>
              );
            })}
          </List>
        </Col>
        <Col md={12}>
          <h3>Documentos disponibles</h3>
          <List>
            {passengers?.map((p, index) => {
              return (
                <List.Item key={index}>
                  <Checkbox
                    onChange={e => {
                      console.log(e.target.checked, e.target.value);
                      if (selectedProfiles.findIndex(e.target.value) == -1) {
                        setSelectedProfiles([...selectedProfiles, e.target.value]);
                      }
                    }}
                    value={p.profile?.uuid}>
                    {p.profile?.name} {p.profile?.last_name}
                  </Checkbox>
                </List.Item>
              );
            })}
          </List>
        </Col>
      </Row>
      <PrimaryButton
        disabled={selectedProfiles?.length === 0}
        block
        label={'Imprimir ' + selectedProfiles?.length + ' documentos'}
      />
    </div>
  );
};

export default PrintContractsDocuments;
