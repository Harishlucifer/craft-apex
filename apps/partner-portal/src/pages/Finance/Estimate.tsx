import React, { useEffect, useState } from 'react';
import TerritoryApiService, { Territory } from '@repo/shared-state/api';

const Estimate: React.FC = () => {
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTerritories = async () => {
            setLoading(true);
            setError(null);

            try {
                // Lazy getInstance inside effect to avoid circular dependency
                const territoryService = TerritoryApiService.getInstance();
                const data = await territoryService.fetchTerritories({ status: 1 });
                setTerritories(data);
            } catch (err: any) {
                console.error('Failed to fetch territories:', err);
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchTerritories().then(r =>console.log(r) );
    }, []);

    if (loading) return <div>Loading territories...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Territories</h2>
            <ul>
                {territories.map((t) => (
                    <li key={t.territory_id}>
                        {t.territory_name} ({t.code})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Estimate;
