import axios from "axios";

// Replace with your actual API endpoint URL
const API_BASE_URL = "https://your-api-endpoint.com/api";

/**
 * Fetch the driver's location.
 * @param {number} driverId - The ID of the driver.
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getDriverLocation = async (driverId: number): Promise<{latitude: number, longitude: number}> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/drivers/${driverId}/location`
    );
    if (response.status === 200) {
      return response.data; // Assumes response contains { latitude, longitude }
    }
    throw new Error("Failed to fetch driver location");
  } catch (error) {
    console.error("Error fetching driver location:", error);
    throw error;
  }
};

/**
 * Update the driver's location.
 * @param {number} driverId - The ID of the driver.
 * @param {number} latitude - The latitude of the new location.
 * @param {number} longitude - The longitude of the new location.
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const updateDriverLocation = async (driverId: number, latitude: number, longitude: number): Promise<{latitude: number, longitude: number}> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/drivers/${driverId}/location`,
      {
        latitude,
        longitude,
      }
    );
    if (response.status === 200) {
      return response.data; // Assumes response contains { latitude, longitude }
    }
    throw new Error("Failed to update driver location");
  } catch (error) {
    console.error("Error updating driver location:", error);
    throw error;
  }
};
