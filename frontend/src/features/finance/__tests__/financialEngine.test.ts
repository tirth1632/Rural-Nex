import { describe, test, expect } from 'vitest';
import {
  calculateCapExTotals,
  calculateLineItemTotal,
  calculateCategorySubtotal,
  calculateCapitalExpenditure,
  calculateOperatingExpenditure,
  calculateCapitalStructure,
  type CapExItem
} from '../services/financialEngine';

describe('Financial Engine Single Source of Truth Calculations', () => {
  test('CRITICAL ACCEPTANCE TEST: Building ₹3,00,000 + Machinery ₹2,00,000 = ₹5,00,000', () => {
    const items: CapExItem[] = [
      { id: '1', category: 'building_civil', name: 'Workshed Construction', quantity: 1, unit_cost: 300000, total_amount: 300000 },
      { id: '2', category: 'plant_machinery', name: 'Primary Operational Machinery', quantity: 1, unit_cost: 200000, total_amount: 200000 }
    ];

    const totals = calculateCapExTotals(items);
    expect(totals.totalProjectCost).toBe(500000);
    expect(totals.totalCapEx).toBe(500000);
    expect(totals.totalWorkingCapital).toBe(0);
    expect(totals.isReconciled).toBe(true);
    expect(totals.reconciliationDelta).toBe(0);
  });

  test('TEST 2: Quantity Multipliers (Building 2 × ₹3,00,000 + Machinery 3 × ₹2,00,000)', () => {
    const items: CapExItem[] = [
      { id: '1', category: 'building_civil', name: 'Workshed Units', quantity: 2, unit_cost: 300000, total_amount: 600000 },
      { id: '2', category: 'plant_machinery', name: 'Processing Machinery Units', quantity: 3, unit_cost: 200000, total_amount: 600000 }
    ];

    const buildingSubtotal = calculateCategorySubtotal(items, 'building_civil');
    const machinerySubtotal = calculateCategorySubtotal(items, 'plant_machinery');
    const totals = calculateCapExTotals(items);

    expect(buildingSubtotal).toBe(600000);
    expect(machinerySubtotal).toBe(600000);
    expect(totals.totalProjectCost).toBe(1200000);
    expect(totals.isReconciled).toBe(true);
  });

  test('TEST 3 & 4: Add and Delete Working Capital Item', () => {
    let items: CapExItem[] = [
      { id: '1', category: 'building_civil', name: 'Workshed Units', quantity: 2, unit_cost: 300000, total_amount: 600000 },
      { id: '2', category: 'plant_machinery', name: 'Processing Machinery Units', quantity: 3, unit_cost: 200000, total_amount: 600000 }
    ];

    // Add ₹50,000 Working Capital Reserve item
    const newItem: CapExItem = {
      id: '3',
      category: 'working_capital',
      name: 'Initial Working Capital Reserve',
      quantity: 1,
      unit_cost: 50000,
      total_amount: 50000
    };

    items = [...items, newItem];
    let totals = calculateCapExTotals(items);
    expect(totals.totalProjectCost).toBe(1250000);
    expect(totals.totalWorkingCapital).toBe(50000);

    // Delete Working Capital item
    items = items.filter(i => i.id !== '3');
    totals = calculateCapExTotals(items);
    expect(totals.totalProjectCost).toBe(1200000);
    expect(totals.totalWorkingCapital).toBe(0);
  });

  test('TEST 5: Unit Cost Change Updates Immediately', () => {
    const items: CapExItem[] = [
      { id: '1', category: 'building_civil', name: 'Workshed Units', quantity: 2, unit_cost: 300000, total_amount: 600000 },
      { id: '2', category: 'plant_machinery', name: 'Processing Machinery Units', quantity: 3, unit_cost: 250000, total_amount: 750000 }
    ];

    const totals = calculateCapExTotals(items);
    expect(totals.totalProjectCost).toBe(1350000);
  });

  test('TEST 6: Separate CapEx vs Working Capital Calculations', () => {
    const items: CapExItem[] = [
      { id: '1', category: 'building_civil', name: 'Workshed Construction', quantity: 1, unit_cost: 300000, total_amount: 300000 },
      { id: '2', category: 'plant_machinery', name: 'Machinery', quantity: 1, unit_cost: 200000, total_amount: 200000 },
      { id: '3', category: 'raw_materials', name: 'Initial Raw Materials', quantity: 1, unit_cost: 50000, total_amount: 50000 },
      { id: '4', category: 'working_capital', name: 'Operating Reserve', quantity: 1, unit_cost: 25000, total_amount: 25000 }
    ];

    const capex = calculateCapitalExpenditure(items);
    const opex = calculateOperatingExpenditure(items);
    const totals = calculateCapExTotals(items);

    expect(capex).toBe(500000);
    expect(opex).toBe(75000);
    expect(totals.totalProjectCost).toBe(575000);
    expect(totals.isReconciled).toBe(true);
  });
});

describe('Step 4 Capital Structure & Financing Calculations (Section 29 Requirements)', () => {
  test('TEST 1: Project ₹12L, Promoter ₹1L -> Non-debt ₹1L, Financing ₹11L, Equity 8.3%, Financing 91.7%', () => {
    const res = calculateCapitalStructure(1200000, 1000000, 200000, 100000, 0, 0);
    expect(res.totalNonDebtFunding).toBe(100000);
    expect(res.financingRequirement).toBe(1100000);
    expect(res.equityPct).toBe(8.3);
    expect(res.financingRequirementPct).toBe(91.7);
    expect(res.isBalanced).toBe(true);
    expect(res.excessFunding).toBe(0);
  });

  test('TEST 2: Project ₹12L, Promoter ₹2L, Partner ₹1L, Other ₹50k -> Non-debt ₹3.5L, Financing ₹8.5L', () => {
    const res = calculateCapitalStructure(1200000, 1000000, 200000, 200000, 100000, 50000);
    expect(res.totalNonDebtFunding).toBe(350000);
    expect(res.financingRequirement).toBe(850000);
    expect(res.equityPct).toBe(29.2);
    expect(res.financingRequirementPct).toBe(70.8);
    expect(res.isBalanced).toBe(true);
  });

  test('TEST 3: Contributions ₹13L exceed Project Cost ₹12L -> Financing ₹0, Excess ₹1L', () => {
    const res = calculateCapitalStructure(1200000, 1000000, 200000, 1000000, 200000, 100000);
    expect(res.totalNonDebtFunding).toBe(1300000);
    expect(res.financingRequirement).toBe(0);
    expect(res.excessFunding).toBe(100000);
    expect(res.isBalanced).toBe(true);
  });

  test('TEST 4: Zero Project Cost -> isZeroCost is true', () => {
    const res = calculateCapitalStructure(0, 0, 0, 100000, 0, 0);
    expect(res.isZeroCost).toBe(true);
    expect(res.financingRequirement).toBe(0);
    expect(res.equityPct).toBe(0);
    expect(res.financingRequirementPct).toBe(0);
  });

  test('TEST 5: Step 3 update from ₹12L to ₹15L updates financing requirement immediately', () => {
    let res = calculateCapitalStructure(1200000, 1000000, 200000, 100000, 0, 0);
    expect(res.financingRequirement).toBe(1100000);

    res = calculateCapitalStructure(1500000, 1300000, 200000, 100000, 0, 0);
    expect(res.financingRequirement).toBe(1400000);
    expect(res.equityPct).toBe(6.7);
    expect(res.financingRequirementPct).toBe(93.3);
  });
});

