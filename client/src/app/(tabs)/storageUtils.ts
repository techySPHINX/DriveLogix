import AsyncStorage from "@react-native-async-storage/async-storage";

// Store data to AsyncStorage
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error storing data:", error);
  }
};

// Retrieve data from AsyncStorage
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
};

// Remove data from AsyncStorage
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing data:", error);
  }
};

// Get geofences from AsyncStorage
export const getGeofencesFromStorage = async (): Promise<any[]> => {
  try {
    const storedGeofences = await AsyncStorage.getItem("geofences");
    return storedGeofences ? JSON.parse(storedGeofences) : [];
  } catch (error) {
    console.error("Error fetching geofences:", error);
    return [];
  }
};

// Save geofences to AsyncStorage
export const saveGeofencesToStorage = async (
  geofences: any[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem("geofences", JSON.stringify(geofences));
  } catch (error) {
    console.error("Error saving geofences:", error);
  }
};

// Update geofence in AsyncStorage
export const updateGeofenceInStorage = async (
  geofences: any[]
): Promise<void> => {
  try {
    await saveGeofencesToStorage(geofences);
  } catch (error) {
    console.error("Error updating geofence in storage:", error);
  }
};

// Save assignments to AsyncStorage
export const saveAssignmentsToStorage = async (
  assignments: any[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem("assignments", JSON.stringify(assignments));
  } catch (error) {
    console.error("Error saving assignments to AsyncStorage:", error);
  }
};

// Get trips from AsyncStorage
export const getTripsFromStorage = async (): Promise<any[]> => {
  try {
    const trips = await AsyncStorage.getItem("trips");
    return trips ? JSON.parse(trips) : [];
  } catch (error) {
    console.error("Error fetching trips from AsyncStorage:", error);
    return [];
  }
};

// Save trips to AsyncStorage
export const saveTripsToStorage = async (trips: any[]): Promise<void> => {
  try {
    await AsyncStorage.setItem("trips", JSON.stringify(trips));
  } catch (error) {
    console.error("Error saving trips to AsyncStorage:", error);
  }
};

// Get driver updates from AsyncStorage
export const getDriverUpdatesFromStorage = async (): Promise<any[]> => {
  try {
    const driverUpdates = await AsyncStorage.getItem("driverUpdates");
    return driverUpdates ? JSON.parse(driverUpdates) : [];
  } catch (error) {
    console.error("Error fetching driver updates from AsyncStorage:", error);
    return [];
  }
};

// Save driver updates to AsyncStorage
export const saveDriverUpdatesToStorage = async (
  driverUpdates: any[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem("driverUpdates", JSON.stringify(driverUpdates));
  } catch (error) {
    console.error("Error saving driver updates to AsyncStorage:", error);
  }
};

// Get assignments from AsyncStorage
export const getAssignmentsFromStorage = async (): Promise<any[]> => {
  try {
    const assignments = await AsyncStorage.getItem("assignments");
    return assignments ? JSON.parse(assignments) : [];
  } catch (error) {
    console.error("Error fetching assignments from AsyncStorage:", error);
    return [];
  }
};

// Default export of the functions
export default {
  storeData,
  getData,
  removeData,
  getGeofencesFromStorage,
  saveGeofencesToStorage,
  updateGeofenceInStorage,
  saveAssignmentsToStorage,
  getTripsFromStorage,
  saveTripsToStorage,
  getDriverUpdatesFromStorage,
  saveDriverUpdatesToStorage,
  getAssignmentsFromStorage,
};
