import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { UseFormRegister, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';

interface AreaItem {
  value: string;
  label: string;
}

interface PincodeItem {
  city_id: string;
  pincode: string;
}

interface FormData {
  gst_no: string;
  address: string;
  pincode: string;
  area: string;
  district: string;
  state: string;
  is_head_office: string;
  status: string;
}

interface GstModelProps {
  areaList: AreaItem[];
  area_id:string;
  selectedArea?: string; // Add this line
  setSelectedArea: (area: string) => void;
  gstModalOpen: boolean;
  handlePincodeSelect: (value: string) => void;
  showPinCodeList: boolean;
  pincodeValues: PincodeItem[];
  findPincode: (value: string) => void;
  setGstModalOpen: (open: boolean) => void;
  handleSubmit: UseFormHandleSubmit<FormData>;
  handleGstCreateOrUpdate: (data: FormData) => void;
  register: UseFormRegister<FormData>;
  isViewMode: boolean;
  errors: FieldErrors<FormData>;
}

export function GstModel({
  areaList,
    selectedArea,
  setSelectedArea,
  gstModalOpen,
  handlePincodeSelect,
  showPinCodeList,
  pincodeValues,
  findPincode,
  setGstModalOpen,
  handleSubmit,
  handleGstCreateOrUpdate,
  register,
  isViewMode,
    area_id,
  errors
}: GstModelProps) {
    return (
        <Dialog open={gstModalOpen} onOpenChange={setGstModalOpen}>
    <DialogContent className="max-w-xl w-full rounded-3xl shadow-2xl transition-transform duration-300 ease-in-out"
    style={{ top: "30%", transform: "translateY(0)" }}>
    {/* Header */}
    <DialogHeader>
        <DialogTitle>Add/Edit GST Details</DialogTitle>
    </DialogHeader>

    {/* Form Fields */}
    <form onSubmit={handleSubmit(handleGstCreateOrUpdate)} className="space-y-4">
        {/*1 st section*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">GST Number</label>
    <input
      {...register('gst_no')}
      placeholder="Enter GSTIN"
      className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${isViewMode ? 'bg-gray-50 text-gray-500' : 'bg-white hover:border-gray-400'}`}
      readOnly={isViewMode}
    />
    {errors.gst_no && (
        <p className="text-red-500 text-xs">{errors.gst_no.message}</p>
    )}
    </div>
    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">Address</label>
        <input
      {...register('address')}
      placeholder="Enter full address"
      className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${isViewMode ? 'bg-gray-50 text-gray-500' : 'bg-white hover:border-gray-400'}`}
      readOnly={isViewMode}
    />
    {errors.address && (
        <p className="text-red-500 text-xs">{errors.address.message}</p>
    )}
    </div>
    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">Pincode</label>
        <div className="relative">
    <input
      type="number"
      {...register('pincode', {})}
      placeholder="Enter pincode"
      className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${isViewMode ? 'bg-gray-50 text-gray-500' : 'bg-white hover:border-gray-400'}`}
      readOnly={isViewMode}
      onChange={(e) => findPincode(e.target.value)}
      // onBlur={()=>setTimeout(() => setShowPinCodeList(false), 200)}
    />
    {showPinCodeList && pincodeValues.length !== 6 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            {pincodeValues.map((item) => (
                    <div
                        key={item?.city_id}
        className="p-2 hover:bg-gray-100 cursor-pointer"
        onClick={() => handlePincodeSelect(item?.pincode)}
    >
        {item.pincode}
        </div>
    ))}
        </div>
    )}
    </div>
    {errors.pincode && (
        <p className="text-red-500 text-xs">{errors.pincode.message}</p>
    )}
    </div>

    </div>

    {/*2nd section*/}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">Area</label>
        <select
      value={selectedArea || ""}
      className={`w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center] ${areaList?.length === 0 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:border-gray-400'}`}
      disabled={areaList?.length === 0}
      onChange={(e) => setSelectedArea(e.target.value)}>
    <option value="">Select area</option>
    {areaList.map((area: AreaItem) => {
        return (
            <option key={area.value} value={area.value}>
                {area.label}
            </option>
        );
    })}
    </select>
    {errors.area && (
        <p className="text-red-500 text-xs">{errors.area.message}</p>
    )}
    </div>
    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">District</label>
        <input
      {...register('district', {})}
      placeholder="Enter district"
      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
      readOnly={true}
    />
    {errors.district && (
        <p className="text-red-500 text-xs">{errors.district.message}</p>
    )}
    </div>
    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">State</label>
        <input
      {...register('state', {})}
      placeholder="Enter state"
      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
      readOnly={true}
    />
    {errors.state && (
        <p className="text-red-500 text-xs">{errors.state.message}</p>
    )}
    </div>
    </div>

    {/*3rd section*/}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">Is Head Office</label>
    <div className="flex items-center space-x-4">
    <label className="flex items-center space-x-2">
    <input
        type="radio"
    {...register('is_head_office', { required: 'Please select an option' })}
    value="1"
    className="h-4 w-4 text-primary"
    disabled={isViewMode}
    defaultChecked
    />
    <span>Yes</span>
    </label>
    <label className="flex items-center space-x-2">
    <input
        type="radio"
    {...register('is_head_office')}
    value="0"
    className="h-4 w-4 text-primary"
    disabled={isViewMode}
    />
    <span>No</span>
    </label>
    </div>
    </div>

    <div className="space-y-2">
    <label className="text-sm font-medium leading-none">Status</label>
        <div className="flex items-center space-x-4">
    <label className="flex items-center space-x-2">
    <input
        type="radio"
    {...register('status', { required: 'Please select a status' })}
    value="1"
    className="h-4 w-4 text-primary"
    disabled={isViewMode}
    defaultChecked
    />
    <span>Active</span>
    </label>
    <label className="flex items-center space-x-2">
    <input
        type="radio"
    {...register('status')}
    value="0"
    disabled={isViewMode}
    className="h-4 w-4 text-primary"
        />
        <span>Inactive</span>
        </label>
        </div>
        </div>

        </div>

    {/*Footer*/}
    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
    <Button
        variant="outline"
    type="button"
    onClick={() => setGstModalOpen(false)}
>
    Cancel
    </Button>
    <Button disabled={isViewMode} type="submit">
        Save Changes
    </Button>
    </div>
    </form>
    </DialogContent>
    </Dialog>
    )
}