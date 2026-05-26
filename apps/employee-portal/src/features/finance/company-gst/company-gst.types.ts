// Types verbatim from legacy:
//   /Components/PayableReceivableManagement/Gst/GstDetails.js (CompanyDetails)
// Field names mirror the legacy `columns` useMemo accessors, including the
// nested corePincodeList → coreCityList → coreStateList chain.

export interface CoreStateList {
  name?: string;
}

export interface CoreCityList {
  name?: string;
  coreStateList?: CoreStateList;
}

export interface CorePincodeList {
  pincode?: string | number;
  area?: string;
  coreCityList?: CoreCityList;
}

export interface CompanyGstRow {
  id?: string | number;
  gstNo?: string;
  address?: string;
  isMainBranch?: boolean | 0 | 1;
  status?: number;
  corePincodeList?: CorePincodeList;
}

export interface CompanyGstPage {
  data: CompanyGstRow[];
  total: number;
}
