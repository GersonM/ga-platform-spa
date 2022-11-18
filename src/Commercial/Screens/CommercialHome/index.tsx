import React from 'react';
import ModuleSidebar from '../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../CommonUI/ModuleContent';
import NavList, {NavListItem} from '../../../CommonUI/NavList';
import {Form, Input} from 'antd';

const CommercialHome = () => {
  return (
    <>
      <ModuleSidebar title={'Contratos'}>
        <NavList>
          <NavListItem
            name={'Contratos'}
            path={'/commercial/contracts'}
            icon={<span className="icon-receipt"></span>}
          />
          <NavListItem
            name={'Pagos'}
            path={'/commercial/payments'}
            icon={<span className="icon-coin-dollar"></span>}
          />
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        <h2>Información de contrato</h2>
        <Form>
          <Form.Item>
            <Input />
          </Form.Item>
        </Form>
      </ModuleContent>
    </>
  );
};

export default CommercialHome;
