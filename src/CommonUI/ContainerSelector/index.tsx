import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {PiCaretRight} from 'react-icons/pi';

import {Container} from '../../Types/api';
import ErrorHandler from '../../Utils/ErrorHandler';
import './styles.less';
import {Empty} from 'antd';

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

          let out = document.getElementById('out');
          if (out) {
            // allow 1px inaccuracy by adding 1
            let isScrolledToBottom = out?.scrollWidth - out?.clientWidth <= out?.scrollLeft + 1;
            console.log(out?.scrollWidth, out?.clientWidth, out?.scrollLeft, isScrolledToBottom);
            console.log(
              'out.scrollWidth - out.clientWidth',
              out?.scrollWidth - out?.clientWidth,
              'out.scrollLeft',
              out?.scrollLeft,
              'isScrolledToBottom',
              isScrolledToBottom,
            );
            out.scrollIntoView();
            if (isScrolledToBottom) out.scrollLeft = out.scrollWidth - out.clientWidth;
          }
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });
  };

  return (
    <div className={'container-selector-wrapper'}>
      <div className={'container-selector-scroll'} id={'out'}>
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
                        className={'container-name' + (container.open ? ' selected' : '')}
                        key={container.uuid}
                        onClick={() => {
                          getContainerLevel(container, lIndex, cIndex);
                          if (onChange) {
                            onChange(container.uuid);
                          }
                        }}>
                        {container.name}
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
  );
};

export default ContainerSelector;
