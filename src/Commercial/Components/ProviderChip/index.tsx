import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { Provider } from '../../../Types/api';

interface ProviderChipProps {
    providerUuid?: string;
    provider?: Provider;
}

const ProviderChip: React.FC<ProviderChipProps> = ({ providerUuid, provider }) => {
    const [fetchedProvider, setFetchedProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!provider && providerUuid) {
            const fetchProvider = async () => {
                setLoading(true);
                try {
                    // Reemplazar con la ruta real de la API o servicio de datos
                    const response = await axios.get(`/commercial/providers/${providerUuid}`);
                    const data = response.data;
                    setFetchedProvider(data);
                } catch (error) {
                    console.error("Error fetching provider info:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProvider();
        }
    }, [providerUuid, provider]);

    const currentProvider = provider || fetchedProvider;

    if (loading) return <span>Cargando...</span>;
    if (!currentProvider) return null;

    return (
        <span className="provider-chip">
            {currentProvider.company?.name}
        </span>
    );
};

export default ProviderChip;
