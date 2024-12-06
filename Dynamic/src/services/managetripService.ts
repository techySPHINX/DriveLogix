// tripService.ts

// Mock data for trips
const trips = [
  {
    id: 1,
    vehicleId: 101,
    startLocation: "City A",
    endLocation: "City B",
    status: "Pending",
    tonnage: 10,
  },
  {
    id: 2,
    vehicleId: 102,
    startLocation: "City C",
    endLocation: "City D",
    status: "In-Route",
    tonnage: 15,
  },
  {
    id: 3,
    vehicleId: 103,
    startLocation: "City E",
    endLocation: "City F",
    status: "Delivered",
    tonnage: 8,
  },
  {
    id: 4,
    vehicleId: 104,
    startLocation: "City G",
    endLocation: "City H",
    status: "Pending",
    tonnage: 20,
  },
  {
    id: 5,
    vehicleId: 105,
    startLocation: "City I",
    endLocation: "City J",
    status: "Pending",
    tonnage: 12,
  },
];

// Mock data for drivers
const drivers = [
  { id: 1, name: "Driver 1", location: "City A", vehicleCapacity: 10 },
  { id: 2, name: "Driver 2", location: "City B", vehicleCapacity: 15 },
  { id: 3, name: "Driver 3", location: "City C", vehicleCapacity: 12 },
  { id: 4, name: "Driver 4", location: "City D", vehicleCapacity: 18 },
  { id: 5, name: "Driver 5", location: "City E", vehicleCapacity: 8 },
  { id: 6, name: "Driver 6", location: "City F", vehicleCapacity: 10 },
  { id: 7, name: "Driver 7", location: "City G", vehicleCapacity: 20 },
  { id: 8, name: "Driver 8", location: "City H", vehicleCapacity: 12 },
  { id: 9, name: "Driver 9", location: "City I", vehicleCapacity: 15 },
  { id: 10, name: "Driver 10", location: "City J", vehicleCapacity: 25 },
];

// Function to find the best driver based on location and vehicle capacity
interface Trip {
  id: number;
  vehicleId: number;
  startLocation: string;
  endLocation: string;
  status: string;
  tonnage: number;
}

const findBestDriver = (trip: Trip) => {
  // Filtering drivers who can carry the trip's tonnage and sorting by proximity to start location
  const bestDriver = drivers
    .filter((driver) => driver.vehicleCapacity >= trip.tonnage)
    .sort((a, b) => {
      if (a.location === trip.startLocation) return -1;
      if (b.location === trip.startLocation) return 1;
      return 0;
    })[0];

  return bestDriver;
};

// Function to assign a trip to the best available driver
const assignTripToDriver = (tripId: number) => {
  const trip = trips.find((t) => t.id === tripId);
  if (trip) {
    const bestDriver = findBestDriver(trip);
    if (bestDriver) {
      console.log(`Trip assigned to ${bestDriver.name}`);
      trip.status = "Assigned"; // Update trip status
      return bestDriver;
    }
    throw new Error("No suitable driver found");
  }
  throw new Error("Trip not found");
};

// Function to update the status of a trip
const updateTripStatus = (tripId: number, status: string) => {
  const trip = trips.find((t) => t.id === tripId);
  if (trip) {
    trip.status = status;
    console.log(`Trip ${tripId} status updated to ${status}`);
    return trip;
  }
  throw new Error("Trip not found");
};

// Example: Assign a trip to the best driver
const assignTrip = async (tripId: number) => {
  try {
    const driver = assignTripToDriver(tripId);
    return driver;
  } catch (error) {
    console.error(error);
  }
};

// Example: Update the status of a trip
const updateStatus = async (tripId: number, status: string) => {
  try {
    const trip = updateTripStatus(tripId, status);
    return trip;
  } catch (error) {
    console.error(error);
  }
};

export default { assignTrip, updateStatus };
