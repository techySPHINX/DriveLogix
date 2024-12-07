// Mocked service for geofence creation
export const createGeofence = async (data: {
  latitude: number;
  longitude: number;
  radius: number;
  time_limit_minutes: number;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGeofence = {
        id: Math.floor(Math.random() * 1000),
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        time_limit_minutes: data.time_limit_minutes,
        name: `Geofence_${data.latitude}_${data.longitude}`,
      };

      resolve(newGeofence);
    }, 1000); // Simulate API delay
  });
};

// Mocked service for driver location update
export const updateDriverLocation = async (
  userId: number,
  latitude: number,
  longitude: number
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const location = {
        userId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };

      resolve(location);
    }, 1000); // Simulate API delay
  });
};

// Mock service to get all geofences
export const getGeofences = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const geofences = [
        {
          id: 1,
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 1000,
          time_limit_minutes: 30,
          name: "San Francisco Geofence",
        },
        {
          id: 2,
          latitude: 34.0522,
          longitude: -118.2437,
          radius: 1500,
          time_limit_minutes: 40,
          name: "Los Angeles Geofence",
        },
        {
          id: 3,
          latitude: 40.7128,
          longitude: -74.006,
          radius: 800,
          time_limit_minutes: 20,
          name: "New York Geofence",
        },
        {
          id: 4,
          latitude: 51.5074,
          longitude: -0.1278,
          radius: 1200,
          time_limit_minutes: 60,
          name: "London Geofence",
        },
      ];
      resolve(geofences);
    }, 1000); // Simulate API delay
  });
};

// Mock service to simulate driver location fetching
export const getDriverLocation = async (userId: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const locations = [
        {
          userId: 1,
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: new Date().toISOString(),
        },
        {
          userId: 2,
          latitude: 34.0522,
          longitude: -118.2437,
          timestamp: new Date().toISOString(),
        },
        {
          userId: 3,
          latitude: 40.7128,
          longitude: -74.006,
          timestamp: new Date().toISOString(),
        },
      ];

      const location = locations.find((loc) => loc.userId === userId);
      resolve(location || null);
    }, 1000); // Simulate API delay
  });
};

// Mock service to simulate geofence violations
export const checkGeofenceViolation = async (
  driverId: number,
  latitude: number,
  longitude: number
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const geofences = [
        {
          id: 1,
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 1000,
        },
        {
          id: 2,
          latitude: 34.0522,
          longitude: -118.2437,
          radius: 1500,
        },
      ];

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
