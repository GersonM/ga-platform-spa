import React from 'react';
import {Avatar, Tooltip} from "antd";

import LoadingIndicator from "../../../CommonUI/LoadingIndicator";
import type {Company} from "../../../Types/api.tsx";
import {LuBuilding2} from "react-icons/lu";

interface CompanyChipProps {
  company?: Company;
  showDocument?: boolean;
}

const CompanyChip = ({company, showDocument = true}: CompanyChipProps) => {
  return (
    <Tooltip title={company?.legal_name}>
      <div className={'profile-chip-container'}>
        <LoadingIndicator visible={!company}/>
        {company && (
          <>
            <Avatar src={company.logo?.source} style={{background: '#7ca2c1'}} className={'avatar'}>
              <LuBuilding2 size={20} style={{marginTop: 6}}/>
            </Avatar>
            <div>
              {company.name}
              {showDocument &&
                <small>RUC: {company.legal_uid}</small>
              }
            </div>
          </>
        )}
      </div>
    </Tooltip>
  );
};

export default CompanyChip;
