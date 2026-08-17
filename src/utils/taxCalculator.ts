import { CanadianProvince, TaxCode } from '../types';

export interface TaxBreakdown {
  subtotal: number;
  gstAmount: number;
  qstAmount: number;
  hstAmount: number;
  total: number;
  taxCode: TaxCode;
}

/**
 * Calculates tax breakdown from pre-tax subtotal based on province / tax code.
 */
export function calculateTaxFromSubtotal(subtotal: number, taxCode: TaxCode, province: CanadianProvince = 'QC'): TaxBreakdown {
  let gstAmount = 0;
  let qstAmount = 0;
  let hstAmount = 0;

  switch (taxCode) {
    case 'GST_QST':
      gstAmount = Math.round(subtotal * 0.05 * 100) / 100;
      qstAmount = Math.round(subtotal * 0.09975 * 100) / 100;
      break;
    case 'GST_5':
      gstAmount = Math.round(subtotal * 0.05 * 100) / 100;
      break;
    case 'QST_9_975':
      qstAmount = Math.round(subtotal * 0.09975 * 100) / 100;
      break;
    case 'HST_13':
      hstAmount = Math.round(subtotal * 0.13 * 100) / 100;
      break;
    case 'HST_15':
      hstAmount = Math.round(subtotal * 0.15 * 100) / 100;
      break;
    case 'EXEMPT':
    case 'ZERO_RATED':
    case 'NONE':
    default:
      break;
  }

  const total = Math.round((subtotal + gstAmount + qstAmount + hstAmount) * 100) / 100;

  return {
    subtotal,
    gstAmount,
    qstAmount,
    hstAmount,
    total,
    taxCode,
  };
}

/**
 * Deconstructs a gross amount (like receipt total) into pre-tax subtotal, GST (5%), and QST (9.975%)
 * Effective combined rate in Quebec is 14.975% (0.05 + 0.09975)
 */
export function extractTaxesFromGrossTotal(grossTotal: number, province: CanadianProvince = 'QC'): TaxBreakdown {
  if (grossTotal <= 0) {
    return { subtotal: 0, gstAmount: 0, qstAmount: 0, hstAmount: 0, total: 0, taxCode: 'NONE' };
  }

  if (province === 'QC') {
    // subtotal = gross / 1.14975
    const subtotal = Math.round((grossTotal / 1.14975) * 100) / 100;
    const gstAmount = Math.round(subtotal * 0.05 * 100) / 100;
    // ensure exact rounding balance
    const qstAmount = Math.round((grossTotal - subtotal - gstAmount) * 100) / 100;
    return {
      subtotal,
      gstAmount,
      qstAmount,
      hstAmount: 0,
      total: grossTotal,
      taxCode: 'GST_QST',
    };
  }

  if (province === 'ON') {
    const subtotal = Math.round((grossTotal / 1.13) * 100) / 100;
    const hstAmount = Math.round((grossTotal - subtotal) * 100) / 100;
    return {
      subtotal,
      gstAmount: 0,
      qstAmount: 0,
      hstAmount,
      total: grossTotal,
      taxCode: 'HST_13',
    };
  }

  // Default GST 5%
  const subtotal = Math.round((grossTotal / 1.05) * 100) / 100;
  const gstAmount = Math.round((grossTotal - subtotal) * 100) / 100;
  return {
    subtotal,
    gstAmount,
    qstAmount: 0,
    hstAmount: 0,
    total: grossTotal,
    taxCode: 'GST_5',
  };
}

export function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
