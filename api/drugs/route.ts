
import { kv } from '@vercel/kv';
import { Drug } from '../../src/types';
import { mockDrugs, generateIdForNewItem } from '../../src/services/mockData';

export const runtime = 'edge';

// GET /api/drugs - Fetches all drugs
export async function GET(_request: Request) {
  try {
    let drugs: Drug[] | null = await kv.get('drugs');

    // If KV is empty (first time run), seed it with mock data
    if (!drugs || drugs.length === 0) {
      console.log('No drugs found in KV, seeding with initial data...');
      await kv.set('drugs', mockDrugs);
      drugs = mockDrugs;
    }

    return new Response(JSON.stringify(drugs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to fetch drugs:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch drugs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/drugs - Adds a new drug
export async function POST(request: Request) {
  try {
    const newDrugData: Omit<Drug, 'id'> = await request.json();
    
    // Basic validation
    if (!newDrugData.name || !newDrugData.quantity || !newDrugData.expiryDate) {
        return new Response(JSON.stringify({ message: 'Missing required fields' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const newDrug: Drug = {
        ...newDrugData,
        id: generateIdForNewItem(),
    };
    
    // Get current list, add new drug, then set it back
    const drugs: Drug[] = (await kv.get('drugs')) || [];
    drugs.push(newDrug);
    await kv.set('drugs', drugs);

    return new Response(JSON.stringify(newDrug), {
      status: 201, // Created
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to add drug:', error);
    return new Response(JSON.stringify({ message: 'Failed to add drug' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}