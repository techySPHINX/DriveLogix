import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  IconButton,
  Menu,
  FAB,
  Provider,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

import managetripService from "../../../services/managetripService";

const TripManagementScreen = () => {
  const [tripId, setTripId] = useState("");
  const [status, setStatus] = useState("");
  const [tripsVisible, setTripsVisible] = useState(false);
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
      upvotes: 0,
      downvotes: 0,
    },
    {
      id: 2,
      vehicleId: 102,
      startLocation: "City C",
      endLocation: "City D",
      status: "In-Route",
      tonnage: 15,
      upvotes: 0,
      downvotes: 0,
    },
    {
      id: 3,
      vehicleId: 103,
      startLocation: "City E",
      endLocation: "City F",
      status: "Delivered",
      tonnage: 8,
      upvotes: 0,
      downvotes: 0,
    },
  ]);

  const [menuVisible, setMenuVisible] = useState(false);

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
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!tripId) {
      alert("Please enter a Trip ID");
      return;
    }
    const updatedTrip = await managetripService.updateStatus(
      Number(tripId),
      newStatus
    );
    if (updatedTrip) {
      setTripList((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === updatedTrip.id
            ? { ...trip, status: updatedTrip.status }
            : trip
        )
      );
      alert(`Trip ${tripId} status updated to ${newStatus}`);
      setStatus("");
    } else {
      alert("Failed to update trip status.");
    }
  };

  const handleVote = (tripId: number, type: "upvote" | "downvote") => {
    setTripList((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              upvotes: type === "upvote" ? trip.upvotes + 1 : trip.upvotes,
              downvotes:
                type === "downvote" ? trip.downvotes + 1 : trip.downvotes,
            }
          : trip
      )
    );
  };

  return (
    <Provider>
      <LinearGradient
        colors={["#A9DFBF", "#58D68D"]} // Light Green Gradient
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Text style={styles.title}>🚚 Trip Management</Text>

          {/* Assign Trip Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Assign Trip</Title>
              <TextInput
                label="Trip ID"
                value={tripId}
                onChangeText={setTripId}
                style={styles.input}
                keyboardType="numeric"
              />
              <Button
                mode="contained"
                icon="account-arrow-right"
                style={styles.button}
                onPress={handleAssignTrip}
              >
                Assign Trip
              </Button>
              {assignedDriver && (
                <Paragraph style={styles.driverInfo}>
                  Assigned Driver:{" "}
                  <Text style={styles.highlight}>{assignedDriver.name}</Text>
                  {"\n"}Location:{" "}
                  <Text style={styles.highlight}>
                    {assignedDriver.location}
                  </Text>
                </Paragraph>
              )}
            </Card.Content>
          </Card>

          {/* Update Status Section */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Update Status</Title>
              <TextInput
                label="Trip ID"
                value={tripId}
                onChangeText={setTripId}
                style={styles.input}
                keyboardType="numeric"
              />
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="contained"
                    icon="menu-down"
                    style={styles.button}
                    onPress={() => setMenuVisible(true)}
                  >
                    {status || "Select Status"}
                  </Button>
                }
              >
                {["Delivered", "Delayed", "In-Route", "Pending"].map(
                  (option) => (
                    <Menu.Item
                      key={option}
                      onPress={() => {
                        setStatus(option);
                        setMenuVisible(false);
                      }}
                      title={option}
                    />
                  )
                )}
              </Menu>
              <Button
                mode="contained"
                icon="check-circle-outline"
                style={styles.button}
                onPress={() => handleUpdateStatus(status)}
              >
                Update Status
              </Button>
            </Card.Content>
          </Card>

          {/* List of Trips */}
          {tripsVisible && (
            <FlatList
              data={tripList}
              renderItem={({ item }) => (
                <Card style={styles.tripCard}>
                  <Card.Content>
                    <Title style={styles.tripTitle}>Trip ID: {item.id}</Title>
                    <Paragraph>
                      🚩 From: {item.startLocation} ➡️ {item.endLocation}
                      {"\n"}📦 Status:{" "}
                      <Text style={styles.highlight}>{item.status}</Text>
                      {"\n"}⚖️ Tonnage: {item.tonnage} tons
                      {"\n"}👍 Upvotes: {item.upvotes} 👎 Downvotes:{" "}
                      {item.downvotes}
                    </Paragraph>
                    <View style={styles.container}>
                      <IconButton
                        icon="thumb-up"
                        onPress={() => handleVote(item.id, "upvote")}
                      />
                      <IconButton
                        icon="thumb-down"
                        onPress={() => handleVote(item.id, "downvote")}
                      />
                    </View>
                  </Card.Content>
                </Card>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </KeyboardAvoidingView>
        <FAB
          style={styles.fab}
          icon={tripsVisible ? "eye-off" : "eye"}
          onPress={() => setTripsVisible(!tripsVisible)}
        />
      </LinearGradient>
    </Provider>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#58D68D", // Light green color
  },
  card: {
    marginVertical: 10,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: "#f7f9f9",
  },
  tripCard: {
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#f7ea62", // Light blue card background
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff", // Darker text for readability
  },
  driverInfo: {
    marginTop: 10,
    fontWeight: "600",
  },
  highlight: {
    color: "#58D68D", // Highlight with green
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#58D68D", // Matching FAB color
  },
});

export default TripManagementScreen;
