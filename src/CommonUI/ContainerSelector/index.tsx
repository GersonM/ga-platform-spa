import {useEffect, useState} from 'react';
import axios from 'axios';
import {Empty} from 'antd';
import {PiCaretRight, PiFolder, PiFolderOpen} from 'react-icons/pi';

import type {Container} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';
import LoadingIndicator from '../LoadingIndicator';
import './styles.less';

interface ContainerSelectorProps {
  onChange?: (value: string) => void;
  _value?: string;
  hidden?: string;
}

const ContainerSelector = ({_value, onChange}: ContainerSelectorProps) => {
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

  const getContainerLevel = (container: Container, level: number, item: number) => {
    setLoading(true);
    axios
      .get(`file-management/containers/${container.uuid}/view`)
      .then(response => {
        setLoading(false);
        if (response) {
          let nLevel = [...containerLevels];
          nLevel[level].forEach(i => (i.open = false));
          nLevel[level][item].open = true;
          nLevel[level + 1] = response.data.containers;
          setContainerLevels(nLevel.slice(0, level + 2));
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <>
      <div className={'container-selector-wrapper'}>
        <div className={'container-selector-scroll'}>
          <LoadingIndicator visible={loading} />
          {containerLevels &&
            containerLevels.map((level, lIndex) => {
              return (
                <div key={lIndex}>
                  <div className={'container-level'}>
                    {level.length == 0 && (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay contenedores'} />
                    )}
                    {level.map((container, cIndex) => {
                      return (
                        <div
                          className={
                            'container-name' +
                            (container.open ? ' open' : '') +
                            (container.uuid === selectedContainer?.uuid ? ' selected' : '')
                          }
                          key={container.uuid}
                          onClick={() => {
                            getContainerLevel(container, lIndex, cIndex);
                            setSelectedContainer(container);
                            if (onChange) {
                              onChange(container.uuid);
                            }
                          }}>
                          {container.open ? (
                            <PiFolderOpen size={18} style={{marginRight: 5}} />
                          ) : (
                            <PiFolder size={18} style={{marginRight: 5}} />
                          )}
                          <span>{container.name}</span>
                          {container.open ? <PiCaretRight /> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      {selectedContainer && (
        <small>
          <strong>Seleccionado</strong>: {selectedContainer?.name}
        </small>
      )}
    </>
  );
};

export default ContainerSelector;
