import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications"; // Use Expo Notifications

const AssignTripScreen = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(
    undefined
  );
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [driverUpdates, setDriverUpdates] = useState<any[]>([]);

  // Fetch trips and driver updates on mount
  useEffect(() => {
    const fetchTripsAndDrivers = async () => {
      const storedTrips = await AsyncStorage.getItem("trips");
      if (storedTrips) setTrips(JSON.parse(storedTrips));

      const storedDriverUpdates = await AsyncStorage.getItem("driverUpdates");
      if (storedDriverUpdates)
        setDriverUpdates(JSON.parse(storedDriverUpdates));
      else setDriverUpdates(generateMockDrivers());
    };

    fetchTripsAndDrivers();
    // Request permissions for notifications
    Notifications.requestPermissionsAsync();
  }, []);

  // Generate mock drivers
  const generateMockDrivers = () => {
    return [
      {
        id: 1,
        name: "John Doe",
        phone: "1234567890",
        statusId: 1,
        address: "Address 1",
      },
      {
        id: 2,
        name: "Jane Doe",
        phone: "0987654321",
        statusId: 2,
        address: "Address 2",
      },
      {
        id: 3,
        name: "Mark Smith",
        phone: "1122334455",
        statusId: 1,
        address: "Address 3",
      },
    ];
  };

  const findDrivers = () => {
    if (!selectedTripId) {
      alert("Please select a trip");
      return;
    }
    setLoading(true);
    setNearbyDrivers(driverUpdates);
    setLoading(false);
  };

  const assignTrip = (driverId: number) => {
    try {
      const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
      if (!selectedTrip) return;

      const assignment = {
        tripId: selectedTripId,
        driverId,
        assignedAt: new Date().getTime(),
        tripDate: selectedTrip.tripDate, // Assuming tripDate is part of your trip data
      };

      // Store assignment in AsyncStorage
      AsyncStorage.getItem("assignments").then((assignmentsData) => {
        const assignments = assignmentsData ? JSON.parse(assignmentsData) : [];
        assignments.push(assignment);
        AsyncStorage.setItem("assignments", JSON.stringify(assignments));

        // Schedule Notification
        scheduleNotification(selectedTrip, driverId);
      });

      alert(`Trip assigned to driver #${driverId}`);
      setNearbyDrivers([]);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // Schedule notification
  const scheduleNotification = async (trip: any, driverId: number) => {
    const tripDate = new Date(trip.tripDate);
    const notificationTime = new Date(tripDate.getTime() - 30 * 60 * 1000); // Notify 30 minutes before trip time

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Your Trip is Scheduled`,
        body: `Driver #${driverId}, your trip to ${
          trip.destination
        } is scheduled at ${tripDate.toLocaleTimeString()}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationTime,
      },
    });

    console.log("Notification scheduled for driver:", driverId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Trip to Driver</Text>
      <Picker
        selectedValue={selectedTripId}
        style={styles.picker}
        onValueChange={(value: number) => setSelectedTripId(value)}
      >
        <Picker.Item label="Select Trip" value={null} />
        {trips.map((trip: { id: number }) => (
          <Picker.Item
            key={trip.id}
            label={`Trip #${trip.id}`}
            value={trip.id}
          />
        ))}
      </Picker>
      <Button title="Find Drivers" onPress={findDrivers} />
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={nearbyDrivers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.driverItem}>
              <Text>{item.name}</Text>
              <Text>
                Status: {item.statusId === 1 ? "Available" : "Not Available"}
              </Text>
              <Button title="Assign Trip" onPress={() => assignTrip(item.id)} />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20 },
  picker: { height: 50 },
  driverItem: {
    marginBottom: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default AssignTripScreen;
