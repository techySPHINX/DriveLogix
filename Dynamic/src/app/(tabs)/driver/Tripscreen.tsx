import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { List, Card, Text, Avatar, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tripservice from "../../../services/tripservice";
import LinearGradient from "react-native-linear-gradient";

const TripScreen = () => {
  const [tripInfo, setTripInfo] = useState({
    currentTrip: { details: "Loading...", icon: "car" },
    previousTrip: { details: "Loading...", icon: "clock-time-past" },
    nextTrip: { details: "Loading...", icon: "airplane" },
  });

  useEffect(() => {
    // Call the mock service to fetch trip data
    tripservice
      .fetchTripInfo()
      .then((data) => {
        const typedData = data as {
          currentTrip: { details: string; icon?: string };
          previousTrip: { details: string; icon?: string };
          nextTrip: { details: string; icon?: string };
        };
        setTripInfo({
          currentTrip: {
            ...typedData.currentTrip,
            icon: typedData.currentTrip.icon || "car",
          },
          previousTrip: {
            ...typedData.previousTrip,
            icon: typedData.previousTrip.icon || "clock-time-past",
          },
          nextTrip: {
            ...typedData.nextTrip,
            icon: typedData.nextTrip.icon || "airplane",
          },
        }); // Set the received data to state
      })
      .catch((error: unknown) => {
        console.error("Error fetching trip data:", error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="Current Trip"
          subtitle="Details of your ongoing journey"
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon={tripInfo.currentTrip.icon || "car"}
              style={styles.avatar}
            />
          )}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            {tripInfo.currentTrip.details}
          </Text>
        </Card.Content>
        <Card.Actions>
          <IconButton
            icon="map-marker"
            iconColor="#6200EE"
            size={20}
            onPress={() => {}}
          />
          <IconButton
            icon="information-outline"
            iconColor="#6200EE"
            size={20}
            onPress={() => {}}
          />
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="Previous Trip"
          subtitle="Details of your last journey"
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon={tripInfo.previousTrip.icon || "clock-time-past"}
              style={styles.avatar}
            />
          )}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            {tripInfo.previousTrip.details}
          </Text>
        </Card.Content>
        <Card.Actions>
          <IconButton
            icon="map-marker"
            iconColor="#03DAC6"
            size={20}
            onPress={() => {}}
          />
          <IconButton
            icon="history"
            iconColor="#03DAC6"
            size={20}
            onPress={() => {}}
          />
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="Next Trip"
          subtitle="Details of your upcoming journey"
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon={tripInfo.nextTrip.icon || "airplane"}
              style={styles.avatar}
            />
          )}
        />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            {tripInfo.nextTrip.details}
          </Text>
        </Card.Content>
        <Card.Actions>
          <IconButton
            icon="calendar"
            iconColor="#FF0266"
            size={20}
            onPress={() => {}}
          />
          <IconButton
            icon="compass-outline"
            iconColor="#FF0266"
            size={20}
            onPress={() => {}}
          />
        </Card.Actions>
      </Card>

      {/* Placeholder for diagram or visual representation */}
      <View style={styles.diagramContainer}>
        <Image
          source={{
            uri: "https://via.placeholder.com/300x150.png?text=Trip+Diagram",
          }}
          style={styles.diagram}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 5,
    backgroundColor: "#ffffff",
  },
  avatar: {
    backgroundColor: "#6200EE",
  },
  description: {
    marginTop: 8,
    color: "#424242",
  },
  diagramContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  diagram: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
});

export default TripScreen;
