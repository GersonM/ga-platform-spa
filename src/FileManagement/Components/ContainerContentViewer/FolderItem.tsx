import dayjs from 'dayjs';
import {FcFolder, FcOpenedFolder} from "react-icons/fc";
import {TbLock, TbWorldCheck} from "react-icons/tb";

import type {Container} from '../../../Types/api';
import IconItem from './IconItem';
import ContainerDropdownActions from '../ContainerDropdownActions';

interface FolderItemProps {
  container: Container;
  size?: number;
  selected?: boolean;
  onDoubleClick?: () => void;
  onClick?: (selected: boolean) => void;
  onChange?: () => void;
}

const FolderItem = ({container, onDoubleClick, onClick, size = 35, onChange, selected}: FolderItemProps) => {
  return (
    <ContainerDropdownActions container={container} trigger={['contextMenu']} onChange={onChange}>
      <div>
        <IconItem
          selected={selected}
          onDoubleClick={onDoubleClick}
          caption={<>
            {container.is_public ?
              <TbWorldCheck title={'Público'} color={'#009322'}/> :
              <TbLock color={'#008ccc'}/>} {dayjs(container.created_at).format(' D/MM/YYYY H:mm')}
          </>}
          onClick={onClick}
          icon={container.is_public ? <FcOpenedFolder size={size}/> : <FcFolder size={size}/>}
          name={container.name}
        />
      </div>
    </ContainerDropdownActions>
  );
};

export default FolderItem;
