
import {Select} from 'antd';

const FamilyRelationSelector = ({...props}) => {
  return (
    <Select
      placeholder={'Elige una opción'}
      showSearch
      options={[
        {label: 'Hijo', value: 'HIJO'},
        {label: 'Hija', value: 'HIJA'},
        {label: 'Tío', value: 'TIO'},
        {label: 'Tía', value: 'TIA'},
        {label: 'Sobrino', value: 'SOBRINO'},
        {label: 'Sobrina', value: 'SOBRINA'},
        {label: 'Cónyuge', value: 'CÓNYUGE'},
        {label: 'Hermano', value: 'HERMANO'},
        {label: 'Hermana', value: 'HERMANA'},
        {label: 'Papá', value: 'PAPÁ'},
        {label: 'Mamá', value: 'MAMÁ'},
        {label: 'Nieto', value: 'NIETO'},
        {label: 'Nieta', value: 'NIETA'},
        {label: 'Yerno', value: 'YERNO'},
        {label: 'Nuera', value: 'NUERA'},
        {label: 'Cuñado', value: 'CUÑADO'},
        {label: 'Cuñada', value: 'CUÑADA'},
        {label: 'Suegro', value: 'SUEGRO'},
        {label: 'Suegra', value: 'SUEGRA'},
        {label: 'Primo', value: 'PRIMO'},
        {label: 'Prima', value: 'PRIMA'},
        {label: 'Otro', value: 'OTRO'},
      ]}
      {...props}
    />
  );
};

export default FamilyRelationSelector;
