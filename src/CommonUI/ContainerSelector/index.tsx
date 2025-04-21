import React, {useEffect, useState} from 'react';
import {Container} from '../../Types/api';
import axios from 'axios';
import ErrorHandler from '../../Utils/ErrorHandler';
import {Col, Row} from 'antd';

interface ContainerSelectorProps {
  onChange?: (value: string) => void;
  value?: string;
}

const ContainerSelector = ({value, onChange}: ContainerSelectorProps) => {
  const [containerLevels, setContainerLevels] = useState<Container[][]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container>();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`file-management/containers`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          if (response.status === 204) {
            setContainerLevels([]);
          }
          setContainerLevels([response.data]);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  useEffect(() => {
    if (!selectedContainer) {
      return;
    }
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
    };
    setLoading(true);
    axios
      .get(`file-management/containers/${selectedContainer?.uuid}/view`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          let nLevel = [...containerLevels];
          nLevel.push(response.data.containers);
          setContainerLevels(nLevel);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [selectedContainer]);

  console.log({containerLevels});

  return (
    <Row gutter={[10, 10]}>
      {containerLevels &&
        containerLevels.map((level, index) => {
          return (
            <Col key={index}>
              {level.map(container => {
                return (
                  <div
                    key={container.uuid}
                    onClick={() => {
                      setSelectedContainer(container);
                      if (onChange) {
                        onChange(container.uuid);
                      }
                    }}>
                    {container.name}
                  </div>
                );
              })}
            </Col>
          );
        })}
    </Row>
  );
};

export default ContainerSelector;
