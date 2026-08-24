// Central place for the v1 settlement policy decisions, so the numbers
// aren't scattered across components. Adjust these as the business
// terms with your PSP / suppliers get finalized.

// Platform commission, taken out of the supplier's payout rather than
// added on top of what the clinic pays (the "embed in commission" model
// from the payments brief). Flip FEE_MODEL to 'passthrough' and this
// becomes an added line item on the clinic's invoice instead.
export const FEE_MODEL = 'embedded' // 'embedded' | 'passthrough'
export const PLATFORM_COMMISSION_RATE = 0.08 // 8%

// Who issues the clinic-facing tax invoice. Marketplace/agency model:
// each supplier is the seller of record, so 'supplier' issues it and
// Platform Co. separately invoices the supplier for commission.
// Merchant-of-record model would set this to 'platform' instead.
export const TAX_INVOICE_ISSUER = 'supplier' // 'platform' | 'supplier'

// Orders at or above this THB total get a payout hold until the return
// window closes, instead of releasing to the supplier as soon as the
// clinic pays.
export const HIGH_VALUE_THRESHOLD_THB = 50000
export const RETURN_WINDOW_DAYS = 14

// goodsAmount = quantity x unit price (what the supplier is selling the
// goods for, before any platform commission).
//
// 'embedded'    -> clinic pays goodsAmount; fee is carved out of the
//                  supplier's payout. Supplier receives less than the
//                  goods price; clinic sees one clean number.
// 'passthrough' -> clinic pays goodsAmount + fee as a separate line;
//                  supplier receives the full goods price.
export function computeSettlement(goodsAmount) {
  const fee = Math.round(goodsAmount * PLATFORM_COMMISSION_RATE * 100) / 100
  if (FEE_MODEL === 'passthrough') {
    return {
      clinicTotal: Math.round((goodsAmount + fee) * 100) / 100,
      platformFee: fee,
      supplierPayout: goodsAmount,
    }
  }
  return {
    clinicTotal: goodsAmount,
    platformFee: fee,
    supplierPayout: Math.round((goodsAmount - fee) * 100) / 100,
  }
}
