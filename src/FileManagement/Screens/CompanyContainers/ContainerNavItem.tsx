import {useContext} from 'react';
import {NavLink} from 'react-router-dom';
import {FiHardDrive, FiTerminal} from 'react-icons/fi';
import {PiDotsThreeVertical, PiGlobeHemisphereWestFill, PiLock} from "react-icons/pi";

import type {Container} from '../../../Types/api';
import ContainerDropdownActions from '../../Components/ContainerDropdownActions';
import IconButton from '../../../CommonUI/IconButton';
import AuthContext from '../../../Context/AuthContext';

interface ContainerNavItemProps {
  container: Container;
  size?: number;
  onChange?: (container: Container) => void;
}

const ContainerNavItem = ({container, onChange}: ContainerNavItemProps) => {
  const {user} = useContext(AuthContext);
  return (
    <>
      <NavLink to={`/file-management/${container.uuid}`}>
        {container.is_locked ? <FiTerminal className={'icon'}/> : <FiHardDrive className={'icon'}/>}
        <span className="label">
          {container.name}
          {!container.is_locked && (
            <small>
              {container.num_files} archivos | {container.num_containers} carpetas
            </small>
          )}
        </span>
      </NavLink>
      {(!container.is_locked || user?.roles?.includes('admin')) && (
        <>
          {container.is_public ? <PiGlobeHemisphereWestFill/> : <PiLock/>}
          <ContainerDropdownActions
            container={container}
            trigger={['click']}
            onChange={() => {
              if (onChange) {
                onChange(container);
              }
            }}>
            <IconButton icon={<PiDotsThreeVertical size={20}/>}/>
          </ContainerDropdownActions>
        </>
      )}
    </>
  );
};

export default ContainerNavItem;
