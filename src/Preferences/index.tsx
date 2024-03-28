import React from 'react';
import TenantForm from './TenantForm'; // Ajusta la ruta según la ubicación de tu componente

function ConfiguracionPage() {
  return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', backgroundColor: '#fff' }}>
            <h1 style={{ color: 'black'}}>Configuración del Tenant</h1>
            <TenantForm />
          </div>
  );
}

export default ConfiguracionPage;
