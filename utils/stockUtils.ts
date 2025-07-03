
import { Drug, StockStatus } from '../types';

/**
 * Determines the stock status of a drug based on its quantity and expiry date.
 * @param drug The drug item to analyze.
 * @returns The calculated StockStatus enum.
 */
export const getStockStatus = (drug: Drug): StockStatus => {
  const expiryDate = new Date(drug.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);
  ninetyDaysFromNow.setHours(0, 0, 0, 0);


  if (expiryDate < today) {
    return StockStatus.Expired;
  }
  if (expiryDate < ninetyDaysFromNow) {
    return StockStatus.ExpiringSoon;
  }
  if (drug.quantity === 0) {
    return StockStatus.OutOfStock;
  }
  // Low stock threshold is now 20, as per the Gemini prompt
  if (drug.quantity < 20) { 
    return StockStatus.LowStock;
  }
  return StockStatus.InStock;
};
