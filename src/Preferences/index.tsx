import React from 'react';
import ModuleContent from '../CommonUI/ModuleContent';
import TenantForm from './TenantForm';

const TenantFormPage = () => {
  return (
          <div>
            <ModuleContent>
              <h1>Configuración del Tenant</h1>
              <TenantForm />
            </ModuleContent>
          </div>
  );
};

export default TenantFormPage;

