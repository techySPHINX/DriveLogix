type Driver = {
  id: number;
  name: string;
  currentLocation: string;
  route: string[]; 
  vehicleCapacity: number;
  vehicleTonnageUsed: number;
  assignedTrips: number[]; 
};

type Trip = {
  id: number;
  source: string;
  destination: string;
  tonnage: number;
  status: string;
  intermediateDestinations?: string[];
  assignedDriverId?: number;
};

let trips: Trip[] = [
  {
    id: 1,
    source: "City A",
    destination: "City D",
    tonnage: 5,
    status: "Pending",
    intermediateDestinations: ["City B"],
  },
  {
    id: 2,
    source: "City B",
    destination: "City E",
    tonnage: 8,
    status: "Pending",
    intermediateDestinations: ["City C"],
  },
  {
    id: 3,
    source: "City F",
    destination: "City G",
    tonnage: 7,
    status: "Pending",
  },
  {
    id: 4,
    source: "City A",
    destination: "City C",
    tonnage: 6,
    status: "Pending",
    intermediateDestinations: ["City B"],
  },
  {
    id: 5,
    source: "City H",
    destination: "City I",
    tonnage: 9,
    status: "Pending",
  },
];

let drivers: Driver[] = [
  {
    id: 1,
    name: "John Doe",
    currentLocation: "City A",
    route: ["City A", "City B", "City D"],
    vehicleCapacity: 20,
    vehicleTonnageUsed: 10,
    assignedTrips: [1],
  },
  {
    id: 2,
    name: "Jane Smith",
    currentLocation: "City B",
    route: ["City B", "City C", "City E"],
    vehicleCapacity: 15,
    vehicleTonnageUsed: 5,
    assignedTrips: [],
  },
  {
    id: 3,
    name: "Alice Johnson",
    currentLocation: "City F",
    route: ["City F", "City G"],
    vehicleCapacity: 25,
    vehicleTonnageUsed: 10,
    assignedTrips: [],
  },
  {
    id: 4,
    name: "Bob Brown",
    currentLocation: "City H",
    route: ["City H", "City I"],
    vehicleCapacity: 18,
    vehicleTonnageUsed: 9,
    assignedTrips: [],
  },
  {
    id: 5,
    name: "Charlie Green",
    currentLocation: "City A",
    route: ["City A", "City B", "City C", "City D"],
    vehicleCapacity: 22,
    vehicleTonnageUsed: 12,
    assignedTrips: [],
  },
];

export const adminTripService = {
  getTrips: () => trips,

  getDrivers: () => drivers,

  createTrip: (tripData: {
    source: string;
    destination: string;
    tonnage: number;
    intermediateDestinations?: string[];
  }) => {
    const newTrip: Trip = {
      id: trips.length + 1,
      ...tripData,
      status: "Pending",
    };
    trips.push(newTrip);
    return newTrip;
  },

  findNearbyDrivers: (tripId: number) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error("Trip not found");

    return drivers.filter((driver) => {
      const isOnRoute =
        driver.route.includes(trip.source) &&
        driver.route.includes(trip.destination) &&
        (trip.intermediateDestinations || []).every((dest) =>
          driver.route.includes(dest)
        );
      const hasCapacity =
        driver.vehicleCapacity - driver.vehicleTonnageUsed >= trip.tonnage;
      const isNotOverAssigned = !driver.assignedTrips.includes(trip.id);
      return isOnRoute && hasCapacity && isNotOverAssigned;
    });
  },

  assignTripToDriver: (tripId: number, driverId: number) => {
    const trip = trips.find((t) => t.id === tripId);
    const driver = drivers.find((d) => d.id === driverId);

    if (!trip || !driver) throw new Error("Invalid trip or driver");

    // Ensure all intermediate destinations are on the driver's route
    if (
      (trip.intermediateDestinations || []).some(
        (dest) => !driver.route.includes(dest)
      )
    ) {
      throw new Error(
        "Driver route does not include all intermediate destinations."
      );
    }

    trip.assignedDriverId = driverId;
    trip.status = "Assigned";
    driver.vehicleTonnageUsed += trip.tonnage;
    driver.assignedTrips.push(trip.id);

    return { trip, driver };
  },
};
