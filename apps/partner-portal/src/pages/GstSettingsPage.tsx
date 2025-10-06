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
import {GstDetails, gstApiService} from "@repo/shared-state/api";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {GstModel} from "@/components/ui/GstModel.tsx";

interface PincodeSuggestion {
    id: number;
    pincode: string;
    area: string;
    city_id: string;
    country_id: string;
    city: string;
    state: string;
    is_head_office: string;
}

type GstFormData = {
    gst_id: string;  // Changed to string to handle bigint values safely
    gst_no: string;
    address: string;
    pincode: number;
    area: string;
    cityId: string;
    state: string;
    district: string;
    is_head_office: string;
    status: string;
    area_id: string;
};

export function GstListPage() {
    const [area_id,setArea_id] = useState("")
    const [isViewMode, setIsViewMode] = useState(false);
    const [pincodeValues, setPincodeValues] = useState<PincodeSuggestion[]>([]);
    const [showPinCodeList, setShowPinCodeList] = useState(false);
    const [areaList, setAreaList] = useState<{value: string | number; label: string}[]>([]);
    const [isLoadingPincode, setIsLoadingPincode] = useState(false);
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
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<GstFormData>();

    const findPincode = async (pincode: any) => {
        try {
            setIsLoadingPincode(true);
            // First fetch suggestions
            if (pincode) {
                const suggestionsRes = await gstApiService.getPincodeSuggestions(pincode);
                if (suggestionsRes.data) {
                    setShowPinCodeList(true);
                    setPincodeValues(suggestionsRes.data);
                }
            }
            // Then fetch details for the exact pincode
            console.log(pincode?.length)
            if (pincode?.length === 6){
                const detailsRes = await gstApiService.getPincodeDetails(pincode);
                if (detailsRes.data){
                    setShowPinCodeList(false);
                    setPincodeValues([])
                    const list = detailsRes.data.map((item) => ({
                        value: item.id,
                        label: item.area,
                    }));
                    setAreaList(list);
                    setValue("district",detailsRes.data[0]?.coreCityList?.name)
                    setValue("state",detailsRes.data[0]?.coreStateList?.name)
                }
            }else{
                setValue("district","")
                setValue("state","")
                setAreaList([])
            }

        } catch (error) {
            console.error('Error fetching pincode:', error);
            toast.error('Failed to fetch pincode details');
        } finally {
            setIsLoadingPincode(false);
        }
    };

    const handlePincodeSelect = async (pincode : any) => {
        console.log("pincode :::", pincode)
        setValue("district","")
        setValue("state","")
        setPincodeValues([])
        setValue('pincode', pincode);
        setShowPinCodeList(false);
        await findPincode(pincode.toString())
    };


    console.log("gstDetails :::", gstDetails)

    const handleGstCreateOrUpdate = async (formData: GstFormData) => {
        try {
            // Convert form data to match API expected format
            const apiData = {
                id: formData.gst_id,
                gst_no: formData.gst_no,
                address: formData.address,
                pincode_id: formData.area_id,
                is_main_branch: formData.is_head_office === "1" ? 1 : 0,
                associate_type : 'CHANNEL',
                associate_id : "174733489075786022",
                status: formData.status === "1" ? 1 : -1
            };

            console.log('Form submitted with data:', apiData);
            await gstApiService.createOrUpdateGst(apiData);
            toast.success('GST details saved successfully!');
            setGstModalOpen(false);
        } catch (error) {
            console.error('Error saving GST details:', error);
            toast.error('Failed to save GST details. Please try again.');
        }
    };

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

    const params = useParams();
    const handleFetchGstData = async () => {
        try {
            setLoading(true);
            setError(null);
            let associateType: string = 'CHANNEL'; // Default value
            const pathname = params['*'] || '';
            if (pathname) {
                if (pathname.includes('company')) {
                    associateType = 'TENANT';
                } else if (pathname.includes('lender')) {
                    associateType = 'LENDER';
                } else if (pathname.includes('gst')) {
                    associateType = 'CHANNEL';
                }
            }

            const req = {
                associate_type: associateType,
                search: searchTerm,
                status: 1
            }
            const response  = await gstApiService.fetchGstDetails(req);
            console.log("gstDetails ::: straight API ,", response.data)
            setGstDetails(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleFetchGstData()
    }, [searchTerm])
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        updateURLParams({search: value, page: '1'});
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({...prev, page: newPage}));
        updateURLParams({page: newPage.toString()});
    };
    const setSelectedArea = (area:any)=> {
        console.log(area.target.value)
        setValue("area_id",area.target.value)
        return area.target.value
    }

    const handleGstView = async (mode : string,id: string) => {
        if (mode === "view"){
            setIsViewMode(true)
        }else if (mode === "edit"){
            setIsViewMode(false)
        }
        try {
            setGstModalOpen(true); // Always open the modal when viewing
            const response = await gstApiService.fetchGstDetailsById(id);
            console.log(response)
            if (response.status){
                setValue("gst_id",response.result.id)
                setValue('gst_no', response.result.gst_no);
                setValue("address",response.result.address)
                console.log("response.result.pincode",response.result)
                setValue("pincode",response.result.pincode_data.pincode)
                await findPincode(response.result.pincode_data.pincode?.toString())
                setValue("area_id",response.result.pincode_data.id)
                setArea_id(response.result.pincode_data.id)
                setValue("area",response.result.pincode_data.area)
                if(response.result.status){
                    setValue("status",response.result.status.toString())
                }else{
                    setValue("status","0")
                }
                if(response.result.is_main_branch){
                    setValue("is_head_office",response.result.is_main_branch.toString())
                }else{
                    setValue("is_head_office","0")
                }

                setShowPinCodeList(false)
            }
        } catch (error) {
            console.error('Error fetching GST details:', error);
            toast.error('Failed to fetch GST details');
        }
    };

    const gstModelStructure = {
        gstModalOpen : gstModalOpen,
        setGstModalOpen:setGstModalOpen,
        handleSubmit:handleSubmit,
        handleGstCreateOrUpdate:handleGstCreateOrUpdate,
        register:register,
        errors:errors,
        setValue:setValue,
        isViewMode:isViewMode,
        findPincode:findPincode,
        showPinCodeList:showPinCodeList,
        pincodeValues:pincodeValues,
        selectedArea:area_id,
        handlePincodeSelect:handlePincodeSelect,
        areaList:areaList,
        setSelectedArea:setSelectedArea,
        area_id,
    }

    return (
        <ModuleLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Partner Gst Details
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage GST registrations for partners (GSTIN, PAN mapping, registration type, and
                            status). </p>
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
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
                                <Input
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="h-4 w-4"/>
                                More Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card title="Lead List" className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {gstDetails.length} of {pagination.total} leads
                            </p>
                            {loading && (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
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
                                            <TableCell
                                                className="font-medium">{gst.corePincodeList?.coreCityList?.coreStateList?.name}</TableCell>
                                            <TableCell
                                                className="font-medium">{gst.corePincodeList?.pincode}</TableCell>
                                            <TableCell>{gst.address}</TableCell>
                                            <TableCell className="break-all">{gst.corePincodeList?.area}</TableCell>
                                            <TableCell>{gst.corePincodeList?.coreCityList?.name}</TableCell>
                                            <TableCell className="font-medium">
                                                {gst.isMainBranch === 1 ? "Yes" : "No"}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={()=>handleGstView("view",gst.id)}>
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                        onClick={()=>handleGstView("edit",gst.id)} >
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
               <GstModel
                   {...gstModelStructure}
               />
        </ModuleLayout>
    );
}
