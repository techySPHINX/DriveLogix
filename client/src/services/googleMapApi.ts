import axios from "axios";

const mockDriverLocation = {
  lat: 22.5726,
  lng: 88.3639, 
};

// Mock function to simulate fetching the driver's current location.
export const getDriverLocation = async (driverId: number) => {
  // In a real application, this would call your backend API
  // For now, we return a mock location
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDriverLocation);
    }, 1000); // Simulate network delay
  });
};

// Mock function to simulate updating the driver's location.
export const updateDriverLocation = async (
  driverId: number,
  latitude: number,
  longitude: number
) => {
  // In a real application, you would use Firebase, a database, or a backend API to persist the data.
  // For now, we mock the update and return the updated location.
  mockDriverLocation.lat = latitude;
  mockDriverLocation.lng = longitude;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDriverLocation);
    }, 1000); // Simulate network delay
  });
};




// Interfaces for data types
export interface Geofence {
  id: number;
  latitude: number;
  longitude: number;
  radius: number;
  time_limit_minutes: number;
  name: string;
}

export interface DriverLocation {
  userId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface GeofenceViolation {
  geofenceId: number;
  isViolation: boolean;
}

// Mock data to simulate a database
let geofences: Geofence[] = [
  {
    id: 1,
    latitude: 22.5726, // Kolkata
    longitude: 88.3639,
    radius: 1000, // in meters
    time_limit_minutes: 30,
    name: "Kolkata Geofence",
  },
];

const driverLocations: DriverLocation[] = [];

// Services

/**
 * Create a new geofence.
 * @param data Geofence details
 * @returns The newly created geofence
 */
export const createGeofence = async (data: {
  latitude: number;
  longitude: number;
  radius: number;
  time_limit_minutes: number;
}): Promise<Geofence> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGeofence: Geofence = {
        id: Math.floor(Math.random() * 1000),
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        time_limit_minutes: data.time_limit_minutes,
        name: `Geofence_${data.latitude}_${data.longitude}`,
      };
      geofences.push(newGeofence);
      resolve(newGeofence);
    }, 1000); // Simulate API delay
  });
};

/**
 * Fetch all geofences.
 * @returns List of geofences
 */
export const getGeofences = async (): Promise<Geofence[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(geofences);
    }, 1000); // Simulate API delay
  });
};

/**
 * Delete a geofence by ID.
 * @param geofenceId Geofence ID
 */
export const deleteGeofence = async (geofenceId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = geofences.findIndex((g) => g.id === geofenceId);
      if (index !== -1) {
        geofences.splice(index, 1);
        resolve();
      } else {
        reject(new Error("Geofence not found"));
      }
    }, 500); // Simulate API delay
  });
};

/**
 * Update driver location.
 * @param userId Driver's user ID
 * @param latitude Current latitude
 * @param longitude Current longitude
 * @returns Updated driver location
 */


/**
 * Fetch the driver's last known location.
 * @param userId Driver's user ID
 * @returns The driver's last known location or null if not found
 */


/**
 * Check for geofence violations.
 * @param driverId Driver's user ID
 * @param latitude Current latitude
 * @param longitude Current longitude
 * @returns List of geofence violations
 */
export const checkGeofenceViolation = async (
  driverId: number,
  latitude: number,
  longitude: number
): Promise<GeofenceViolation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const violations = geofences.map((geofence) => {
        const distance = calculateDistance(
          geofence.latitude,
          geofence.longitude,
          latitude,
          longitude
        );
        const isOutside = distance > geofence.radius;
        return {
          geofenceId: geofence.id,
          isViolation: isOutside,
        };
      });
      resolve(violations);
    }, 1000); // Simulate API delay
  });
};

/**
 * Calculate the distance between two points using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
