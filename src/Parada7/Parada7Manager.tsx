import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContentHeader from '../CommonUI/ModuleContent/ContentHeader';

const Parada7Manager = () => {
  const [companies, setCompanies] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    axios.get('parada7/companies')
      .then((response) => {
        setCompanies(response.data);
        console.log(response.data);
      })
      .catch((error) => console.error('Error fetching companies:', error));
  }, [reload]);

  return (
    <div style={{ padding: 20 }}>
      <ContentHeader
        title="Parada 7 Manager"
        onRefresh={() => setReload(!reload)}
      />
      <p>Bienvenido al módulo de Parada 7.</p>
    </div>
  );
};

export default Parada7Manager;
