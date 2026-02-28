import React from 'react';
import {Select} from "antd";

import useGetRoles from "../../../AccountManagement/Hooks/useGetRoles.tsx";

interface RolesSelectorProps {
  value?: any;
  placeholder?: string;
}

const RolesSelector = ({placeholder, ...props}: RolesSelectorProps) => {
  const {roles} = useGetRoles();

  return (
    <Select
      {...props}
      style={{width: '100%', minWidth: 150}}
      allowClear
      placeholder={placeholder || 'Elige un rol'}
      mode={'multiple'}
      popupMatchSelectWidth={false}
      options={roles?.map(role => ({label: role.name, value: role.id}))}
    />
  );
};

export default RolesSelector;
