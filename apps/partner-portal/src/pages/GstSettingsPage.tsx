import {ModuleLayout} from "@repo/ui/module";
import {Button} from "@repo/ui/components/ui/button";
import {Filter, Loader2, MoreHorizontal, Plus, Search} from "lucide-react";
import {useParams, useSearchParams} from "react-router-dom";
import {Input} from "@repo/ui/components/ui/input";
import {Card} from "@repo/ui/components/ui/card";
import React, {useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@repo/ui/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu";
import {GstDetails, GstListResponse, gstApiService} from "@repo/shared-state/api";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@repo/ui/components/ui/dialog";


export function GstListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [gstDetails, setGstDetails] = useState<GstDetails[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: parseInt(searchParams.get('page') || '1'),
        size: parseInt(searchParams.get('size') || '10'),
        total: 0
    });

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [gstModalOpen, setGstModalOpen] = useState(false);

    const updateURLParams = (params: Record<string, string>) => {
        const newSearchParams = new URLSearchParams(searchParams);
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                newSearchParams.set(key, value);
            } else {
                newSearchParams.delete(key);
            }
        });
        setSearchParams(newSearchParams);
    };

    const params  = useParams();
    const handleFetchGstData = async () => {
        try {
            setLoading(true);
            setError(null);
            let associateType: string = 'CHANNEL'; // Default value
            const pathname = params['*'] || '';
            if (pathname) {
                if (pathname.includes('company')) {
                    associateType = 'TENANT';
                }
                else if (pathname.includes('lender')) {
                    associateType = 'LENDER';
                }
                else if (pathname.includes('gst')) {
                    associateType = 'CHANNEL';
                }
            }

            const req = {
                associate_type : associateType,
                search : searchTerm,
                status:1
            }
            const response: GstListResponse = await gstApiService.fetchGst(req);

            setGstDetails(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        handleFetchGstData()
    },[searchTerm])
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        updateURLParams({ search: value, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        updateURLParams({ page: newPage.toString() });
    };

    return (
        <ModuleLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Partner Gst Details
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage GST registrations for partners (GSTIN, PAN mapping, registration type, and status).                        </p>
                    </div>
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => setGstModalOpen(!gstModalOpen)}
                    >
                        <Plus className="h-4 w-4"/>
                        Add GST
                    </Button>
                </div>
                {/* Filters and Search */}
                <Card title="Lead Management" className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Leads Table */}
                <Card title="Lead List" className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {gstDetails.length} of {pagination.total} leads
                            </p>
                            {loading && (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Loading...</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <p className="text-red-800 text-sm">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFetchGstData()}
                                    className="mt-2"
                                >
                                    Retry
                                </Button>
                            </div>
                        )}

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>GSTN</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead>Pincode</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Area</TableHead>
                                        <TableHead>District</TableHead>
                                        <TableHead>Is Head Office</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gstDetails.map((gst) => (
                                        <TableRow key={gst.id}>
                                            <TableCell className="font-medium">{gst.gstNo}</TableCell>
                                            <TableCell className="font-medium">{gst.corePincodeList?.coreCityList?.coreStateList?.name}</TableCell>
                                            <TableCell className="font-medium">{gst.corePincodeList?.pincode}</TableCell>
                                            <TableCell>{gst.address}</TableCell>
                                            <TableCell className="break-all">{gst.corePincodeList?.area}</TableCell>
                                            <TableCell>{gst.corePincodeList?.coreCityList?.name}</TableCell>
                                            <TableCell className="font-medium">
                                                {gst.isMainBranch === 1 ? "Yes" : "No"}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    gst.status === 1 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {gst.status === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setGstModalOpen(!gstModalOpen)}>
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {!loading && gstDetails.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    {error ? 'Failed to load leads.' : 'No leads found matching your criteria.'}
                                </p>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && gstDetails.length > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* GST Toggle Modal */}
            <Dialog open={gstModalOpen} onOpenChange={setGstModalOpen}>
                <DialogContent>
                    {/* Header */}
                    <DialogHeader>
                        <DialogTitle>Add/Edit GST Details</DialogTitle>
                    </DialogHeader>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">GST Number</label>
                                <Input placeholder="Enter GSTIN" className="w-full"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Address</label>
                                <Input placeholder="Enter full address" className="w-full"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Pincode</label>
                                <Input type="number" placeholder="Enter pincode" className="w-full"/>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Area</label>
                                <Input placeholder="Enter area" className="w-full"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">District</label>
                                <Input className="w-full"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">State</label>
                                <Input className="w-full"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Is Head Office</label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input type="radio" name="office" value="1" className="h-4 w-4 text-primary"
                                               defaultChecked/>
                                        <span>Yes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="radio" name="office" value="0" className="h-4 w-4 text-primary"/>
                                        <span>No</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Status</label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input type="radio" name="status" value="1" className="h-4 w-4 text-primary"
                                               defaultChecked/>
                                        <span>Active</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="radio" name="status" value="0" className="h-4 w-4 text-primary"/>
                                        <span>Inactive</span>
                                    </label>
                                </div>
                            </div>

                        </div>


                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                        <Button variant="outline" onClick={() => setGstModalOpen(false)}>
                        Cancel
                        </Button>
                        <Button>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </ModuleLayout>
    );
}
