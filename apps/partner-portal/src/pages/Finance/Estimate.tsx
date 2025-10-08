import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TerritoryApiService, Territory } from '@repo/shared-state/api';

interface FilterState {
    territoryType: string;
    territory: string;
    employee: string;
    month: string;
}

const Estimate: React.FC = () => {
    const [filters, setFilters] = useState<FilterState>({
        territoryType: '',
        territory: '',
        employee: '',
        month: ''
    });
    const [territoryTypes, setTerritoryTypes] = useState<string[]>([]); // just names: Country, Zone, Branch
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const territoryApi = TerritoryApiService.getInstance();

    const { data: allTerritories, isLoading, isError, error } = useQuery<Territory[], Error>({
        queryKey: ['territories', 'all'],
        queryFn: async () => {
            return await territoryApi.fetchTerritories({ status: 1 });
        }
    });


    // Extract unique territory type names
    useEffect(() => {
        if (allTerritories) {
            const uniqueTypes = Array.from(
                new Set(allTerritories.map(t => t.territory_type_name))
            );
            setTerritoryTypes(uniqueTypes);
        }
    }, [allTerritories]);

    // Filter territories locally based on selected territory type
    useEffect(() => {
        if (filters.territoryType && allTerritories) {
            const filtered = allTerritories.filter(
                t => t.territory_type_name === filters.territoryType
            );
            setTerritories(filtered);
        } else {
            setTerritories([]);
        }
    }, [filters.territoryType, allTerritories]);

    const handleFilterChange = (field: keyof FilterState, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev, [field]: value };
            if (field === 'territoryType') newFilters.territory = ''; // reset dependent
            return newFilters;
        });
    };

    const handleFilter = () => console.log('Filtering with:', filters);
    const handleCalculateEstimate = () => console.log('Calculating estimate with:', filters);

    if (isLoading) return <div>Loading territories...</div>;
    if (isError) return <div>Error: {(error as any)?.message || 'Failed to load territories'}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Territory Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Territory Type
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.territoryType}
                                    onChange={e => handleFilterChange('territoryType', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                                >
                                    <option value="">Select...</option>
                                    {territoryTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Territory */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Territory
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.territory}
                                    onChange={e => handleFilterChange('territory', e.target.value)}
                                    disabled={!filters.territoryType}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select...</option>
                                    {territories.map(t => (
                                        <option key={t.territory_id} value={t.territory_id}>
                                            {t.territory_name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Employee */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee*</label>
                            <select
                                value={filters.employee}
                                onChange={e => handleFilterChange('employee', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                            >
                                <option value="">Select...</option>
                                <option value="employee1">John Doe</option>
                                <option value="employee2">Jane Smith</option>
                                <option value="employee3">Mike Johnson</option>
                            </select>
                        </div>

                        {/* Month */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Month*</label>
                            <input
                                type="date"
                                value={filters.month}
                                onChange={e => handleFilterChange('month', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleFilter}
                            className="px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                        >
                            Filter
                        </button>
                        <button
                            onClick={handleCalculateEstimate}
                            className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
                        >
                            Calculate Estimate
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Earnings To Date</h3>
                        <p className="text-3xl font-bold text-gray-800">₹1,96,000</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Lead Count</h3>
                        <p className="text-3xl font-bold text-gray-800">7</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Payable Count</h3>
                        <p className="text-3xl font-bold text-gray-800">7</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                    />
                </div>
            </div>
        </div>
    );
};

export default Estimate;
