// services/mockService.ts

const fetchTripInfo = () => {
  // Simulate an API call with a delay (using setTimeout)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulated trip data (mimicking a real response)
      const tripInfo = {
        currentTrip: {
          details: "In-route to destination A, expected arrival in 30 minutes.",
        },
        previousTrip: {
          details: "Delivered to location B, completed on time.",
        },
        nextTrip: {
          details: "Pickup scheduled for location C in 2 hours.",
        },
      };
      resolve(tripInfo);
    }, 2000); // 2 seconds delay to simulate fetching data
  });
};

export default { fetchTripInfo };
