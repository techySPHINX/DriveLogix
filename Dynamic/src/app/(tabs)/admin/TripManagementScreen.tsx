import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";
import managetripService from "../../../services/managetripService";

const TripManagementScreen = () => {
  const [driverId, setDriverId] = useState("");
  const [tripId, setTripId] = useState("");
  const [status, setStatus] = useState("");
  const [assignedDriver, setAssignedDriver] = useState<{
    id: number;
    name: string;
    location: string;
    vehicleCapacity: number;
  } | null>(null);
  const [tripList, setTripList] = useState([
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
  ]);

  const handleAssignTrip = async () => {
    if (!tripId) {
      alert("Please enter a Trip ID");
      return;
    }
    const assignedDriver = await managetripService.assignTrip(Number(tripId));
    if (assignedDriver) {
      setAssignedDriver(assignedDriver);
    } else {
      alert("Failed to assign trip to driver.");
    }
    alert("Trip assigned to driver!");
  };

  const handleUpdateStatus = async () => {
    if (!tripId || !status) {
      alert("Please enter a Trip ID and select a status");
      return;
    }
    const updatedTrip = await managetripService.updateStatus(
      Number(tripId),
      status
    );
    if (updatedTrip) {
      setTripList((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === updatedTrip.id
            ? { ...trip, status: updatedTrip.status }
            : trip
        )
      );
      alert(`Trip ${tripId} status updated to ${status}`);
    } else {
      alert("Failed to update trip status.");
    }
    alert(`Trip ${tripId} status updated to ${status}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Management</Text>

      {/* Assign Trip Section */}
      <Text>Assign Trip to Driver</Text>
      <TextInput
        placeholder="Trip ID"
        value={tripId}
        onChangeText={setTripId}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button title="Assign Trip" onPress={handleAssignTrip} />

      {assignedDriver && (
        <View style={styles.driverInfo}>
          <Text>Assigned Driver: {assignedDriver.name}</Text>
          <Text>Driver Location: {assignedDriver.location}</Text>
        </View>
      )}

      {/* Update Status Section */}
      <Text>Update Trip Status</Text>
      <TextInput
        placeholder="Trip ID"
        value={tripId}
        onChangeText={setTripId}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Status (Pending, In-Route, Delivered)"
        value={status}
        onChangeText={setStatus}
        style={styles.input}
      />
      <Button title="Update Status" onPress={handleUpdateStatus} />

      {/* List of Trips */}
      <Text style={styles.subTitle}>Trips</Text>
      <FlatList
        data={tripList}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <Text>Trip ID: {item.id}</Text>
            <Text>
              From: {item.startLocation} to {item.endLocation}
            </Text>
            <Text>Status: {item.status}</Text>
            <Text>Tonnage: {item.tonnage} tons</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  driverInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  tripCard: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default TripManagementScreen;
