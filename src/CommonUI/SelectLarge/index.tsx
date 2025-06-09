import {useState} from 'react';
import './styles.less';

interface SelectLargeProps {
  items?: string[];
  value?: string;
  onChange?: (value: string) => void;
}

const SelectLarge = ({value, onChange, items}: SelectLargeProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>();

  return (
    <div>
      <span onClick={() => setOpen(!open)}>{selectedItem || 'Seleccionar un item'}</span>
      {selectedItem && <span onClick={() => setSelectedItem(undefined)}>X</span>}
      {open && (
        <ul className={'select-large-list-container'}>
          {items?.map((item, index) => (
            <li key={index} onClick={() => setSelectedItem(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectLarge;
