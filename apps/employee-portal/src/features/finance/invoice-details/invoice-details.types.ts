// Legacy craft-frontend/src/Components/PayableReceivableManagement/InVoice/invoiceWorkFlow.js
//   GET ${APIENDPOINTS.GET_INVOICE_LIST}/{id}      -> /alpha/v1/finance/invoice/{id}
//     -> setInvoiceData(res?.data?.result)
//   GET ${APIENDPOINTS.PARTNER_DATA_FETCH}         -> /alpha/v1/partner/{channelId}
//     -> setChannelInfo(res?.data?.result)
//
// Only the fields the legacy detail screen reads are typed here. Anything else
// returned by the API is intentionally not modeled (no-guessing rule).

// invoiceData fields read by the legacy detail screen:
//   invoiceData?.id
//   invoiceData?.invoice_no
//   invoiceData?.created_at
//   invoiceData?.net_amount
//   invoiceData?.tax_amount
//   invoiceData?.total_amount
//   invoiceData?.channel_id   (used to fetch partner)
export interface InvoiceDetail {
  id?: string | number;
  invoice_no?: string;
  created_at?: string;
  net_amount?: string | number;
  tax_amount?: string | number;
  total_amount?: string | number;
  channel_id?: string | number;
}

export interface InvoiceDetailResponse {
  data?: {
    result?: InvoiceDetail;
  };
}

// channelInfo fields read by the legacy detail screen:
//   channelInfo?.application?.name
//   channelInfo?.application?.channel_id
//   channelInfo?.application?.category
//   channelInfo?.application?.mobile
//   channelInfo?.application?.partner_type
export interface PartnerApplication {
  name?: string;
  channel_id?: string | number;
  category?: string;
  mobile?: string | number;
  partner_type?: string;
}

export interface PartnerInfo {
  application?: PartnerApplication;
}

export interface PartnerInfoResponse {
  data?: {
    result?: PartnerInfo;
  };
}
