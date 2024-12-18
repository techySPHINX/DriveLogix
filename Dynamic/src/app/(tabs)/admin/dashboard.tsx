import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, List } from "react-native-paper";
import {
  NavigationIndependentTree,
  useNavigation,
  NavigationContainer,
} from "@react-navigation/native";
import DriverLocationScreen from "./DriverLocationScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MisReportScreen from "./MISReportScreen";

const Stack = createNativeStackNavigator();

const AdminDashboard = () => {
  const navigation = useNavigation();

  // Mock data
  const metrics = {
    totalTrips: 34,
    totalDrivers: 10,
    successfulTrips: 20,
    futureTrips: 56,
  };

  const notifications = [
    { id: 1, message: "Driver Raghav completed a trip successfully." },
    { id: 2, message: "New driver registration: Deepak." },
    { id: 3, message: "Upcoming trip scheduled for tomorrow." },
    { id: 4, message: "Trip cancellation reported by driver Mar." },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your's Dashboard</Text>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <Card style={[styles.card, styles.cardShadow]}>
          <Card.Title title="Total Trips" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.number}>{metrics.totalTrips}</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.card, styles.cardShadow]}>
          <Card.Title title="Total Drivers" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.number}>{metrics.totalDrivers}</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.card, styles.cardShadow]}>
          <Card.Title title="Successful Trips" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.number}>{metrics.successfulTrips}</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.card, styles.cardShadow]}>
          <Card.Title title="Future Trips" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.number}>{metrics.futureTrips}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Notifications Section */}
      <Text style={styles.sectionHeader}>Recent Notifications</Text>
      <View style={styles.notificationsContainer}>
        {notifications.map((notification) => (
          <List.Item
            key={notification.id}
            title={notification.message}
            left={(props) => <List.Icon {...props} icon="bell" />}
            style={styles.notificationItem}
            titleStyle={styles.notificationText}
          />
        ))}
      </View>

      {/* Navigation Button */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate("MisReportScreen" as never)}
        style={styles.navigateButton}
        labelStyle={styles.buttonLabel}
      >
        Generate MIS
      </Button>
    </ScrollView>
  );
};
const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="dashboard"
    >
      <Stack.Screen name="dashboard" component={AdminDashboard} />
      <Stack.Screen name="MisReportScreen" component={MisReportScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "48%",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  number: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  notificationsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  notificationText: {
    fontSize: 14,
    color: "#666",
  },
  navigateButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#2196F3",
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    color: "#fff",
  },
});

export default AdminStack;
