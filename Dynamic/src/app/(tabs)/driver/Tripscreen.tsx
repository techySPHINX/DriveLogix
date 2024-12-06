import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { List, Card, Text } from "react-native-paper";
import tripservice from "../../../services/tripservice";

const TripScreen = () => {
  const [tripInfo, setTripInfo] = useState({
    currentTrip: { details: "Loading..." },
    previousTrip: { details: "Loading..." },
    nextTrip: { details: "Loading..." },
  });

  useEffect(() => {
    // Call the mock service to fetch trip data
    tripservice.fetchTripInfo()
      .then((data) => {
        const typedData = data as { currentTrip: { details: string }; previousTrip: { details: string }; nextTrip: { details: string } };
        setTripInfo(typedData); // Set the received data to state
      })
      .catch((error: unknown) => {
        console.error("Error fetching trip data:", error);
      });
  }, []);

  return (
    <View style={styles.container}>
      {/* Current Trip Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Current Trip</Text>
          <List.Item
            title="Details"
            description={tripInfo.currentTrip.details}
          />
        </Card.Content>
      </Card>

      {/* Previous Trip Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Previous Trip</Text>
          <List.Item
            title="Details"
            description={tripInfo.previousTrip.details}
          />
        </Card.Content>
      </Card>

      {/* Next Trip Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Next Trip</Text>
          <List.Item title="Details" description={tripInfo.nextTrip.details} />
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4", // Light background for better contrast
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 5,
    backgroundColor: "#fff", // White background for cards
  },
});

export default TripScreen;
