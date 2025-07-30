import React from 'react';
import {Avatar, Tooltip} from "antd";
import {TbBuilding} from "react-icons/tb";

import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import type {Company} from "../../../Types/api.tsx";

interface CompanyChipProps {
  company?: Company;
}

const CompanyChip = ({company}: CompanyChipProps) => {
  return (
    <Tooltip title={company?.legal_name}>
      <div className={'profile-chip-container'}>
        <LoadingIndicator visible={!company}/>
        {company && (
          <>
            <Avatar src={company.logo?.thumbnail} className={'avatar'}>
              <TbBuilding size={22} style={{marginTop: 6}}/>
            </Avatar>
            <div>
              {company.name}
              <small>RUC: {company.legal_uid}</small>
            </div>
          </>
        )}
      </div>
    </Tooltip>
  );
};

export default CompanyChip;
