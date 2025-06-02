export interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  [key: string]: any;
}

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