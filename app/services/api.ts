import { getCachedData, setCachedData } from './cache';
import { Circuit } from '../models/Circuit';

export interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  [key: string]: any;
}

export async function getDrivers2025(): Promise<Driver[]> {
  const CACHE_KEY = 'drivers2025';
  const cached = await getCachedData(CACHE_KEY);
  if (cached) return cached;
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/2025/drivers/');
    if (!res.ok) throw new Error('Failed to fetch drivers');
    const data = await res.json();
    const drivers = data.MRData.DriverTable.Drivers;
    await setCachedData(CACHE_KEY, drivers);
    return drivers;
  } catch (error) {
    throw error;
  }
}

export async function getCircuits2025(): Promise<Circuit[]> {
  const CACHE_KEY = 'circuits2025';
  const cached = await getCachedData(CACHE_KEY);
  if (cached) return cached;
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/2025/circuits/');
    if (!res.ok) throw new Error('Failed to fetch circuits');
    const data = await res.json();
    const circuits = data.MRData.CircuitTable.Circuits;
    await setCachedData(CACHE_KEY, circuits);
    return circuits;
  } catch (error) {
    throw error;
  }
}
