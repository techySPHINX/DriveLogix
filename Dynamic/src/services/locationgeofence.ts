// Import or define required types/interfaces
interface Geofence {
  id: number;
  latitude: number;
  longitude: number;
  radius: number;
  time_limit_minutes: number;
  name: string;
}

interface DriverLocation {
  userId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface GeofenceViolation {
  geofenceId: number;
  isViolation: boolean;
}

// Mock data
let geofences: Geofence[] = [
  {
    id: 1,
    latitude: 22.5726, // Kolkata
    longitude: 88.3639,
    radius: 1000, // in meters
    time_limit_minutes: 30,
    name: "Kolkata Geofence",
  },
  {
    id: 2,
    latitude: 21.9146, // Kharagpur
    longitude: 87.3294,
    radius: 1500, // in meters
    time_limit_minutes: 40,
    name: "Kharagpur Geofence",
  },
  {
    id: 3,
    latitude: 21.4935, // Balasore
    longitude: 86.9337,
    radius: 800, // in meters
    time_limit_minutes: 20,
    name: "Balasore Geofence",
  },
  {
    id: 4,
    latitude: 20.2961, // Bhubaneswar
    longitude: 85.8245,
    radius: 1200, // in meters
    time_limit_minutes: 60,
    name: "Bhubaneswar Geofence",
  },
];

const driverLocations: DriverLocation[] = [];

// Services

// Create a new geofence
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

// Fetch all geofences
export const getGeofences = async (): Promise<Geofence[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(geofences);
    }, 1000); // Simulate API delay
  });
};

// Delete a geofence by ID
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

// Update driver location
export const updateDriverLocation = async (
  userId: number,
  latitude: number,
  longitude: number
): Promise<DriverLocation> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLocation: DriverLocation = {
        userId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };
      driverLocations.push(newLocation);
      resolve(newLocation);
    }, 1000); // Simulate API delay
  });
};

// Fetch driver location
export const getDriverLocation = async (
  userId: number
): Promise<DriverLocation | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const location = driverLocations.find((loc) => loc.userId === userId);
      resolve(location || null);
    }, 1000); // Simulate API delay
  });
};

// Check for geofence violations
export const checkGeofenceViolation = async (
  driverId: number,
  latitude: number,
  longitude: number
): Promise<GeofenceViolation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const violations = geofences.map((geofence) => {
        const distance = Math.sqrt(
          Math.pow(geofence.latitude - latitude, 2) +
            Math.pow(geofence.longitude - longitude, 2)
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
