import React, { useState } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { adminTripService } from "../../../services/adminTripService";

const AssignTripScreen = () => {
  const [trips] = useState(adminTripService.getTrips());
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(undefined);
  const [nearbyDrivers, setNearbyDrivers] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const findDrivers = () => {
    if (!selectedTripId) {
      alert("Please select a trip");
      return;
    }
    setLoading(true);
    setNearbyDrivers(adminTripService.findNearbyDrivers(selectedTripId));
    setLoading(false);
  };

  const assignTrip = (driverId: number) => {
    try {
      const { trip, driver } = adminTripService.assignTripToDriver(
        selectedTripId!,
        driverId
      );
      alert(`Trip #${trip.id} assigned to ${driver.name}`);
      setNearbyDrivers([]);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Nearby Drivers</Text>
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
      <FlatList
        data={nearbyDrivers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
            <Button title="Assign Trip" onPress={() => assignTrip(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20 },
  picker: { height: 50 },
});

export default AssignTripScreen;
