export interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  [key: string]: any;
}

import { Circuit } from '../models/Circuit';

export async function getDrivers2025(): Promise<Driver[]> {
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/2025/drivers/');
    if (!res.ok) throw new Error('Failed to fetch drivers');
    const data = await res.json();
    console.log('Fetched drivers:', data.MRData.DriverTable.Drivers);
    return data.MRData.DriverTable.Drivers;
  } catch (error) {
    throw error;
  }
}

export async function getCircuits2025(): Promise<Circuit[]> {
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/2025/circuits/');
    if (!res.ok) throw new Error('Failed to fetch circuits');
    const data = await res.json();
    return data.MRData.CircuitTable.Circuits;
  } catch (error) {
    throw error;
  }
}