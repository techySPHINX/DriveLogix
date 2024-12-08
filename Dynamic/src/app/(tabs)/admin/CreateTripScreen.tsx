import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import { adminTripService } from "../../../services/adminTripService";

const CreateTripScreen = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [tonnage, setTonnage] = useState("");
  const [intermediateDestinations, setIntermediateDestinations] = useState<
    string[]
  >([]);
  const [newDestination, setNewDestination] = useState("");

  const navigation = useNavigation(); // Initialize navigation

  const addIntermediateDestination = () => {
    if (newDestination) {
      setIntermediateDestinations([
        ...intermediateDestinations,
        newDestination,
      ]);
      setNewDestination("");
    }
  };

  const createTrip = () => {
    const trip = adminTripService.createTrip({
      source,
      destination,
      tonnage: parseFloat(tonnage),
      intermediateDestinations,
    });
    alert(`Trip created: ${trip.id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Trip</Text>
      <TextInput
        placeholder="Source"
        style={styles.input}
        value={source}
        onChangeText={setSource}
      />
      <TextInput
        placeholder="Destination"
        style={styles.input}
        value={destination}
        onChangeText={setDestination}
      />
      <TextInput
        placeholder="Tonnage"
        style={styles.input}
        value={tonnage}
        onChangeText={setTonnage}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Intermediate Destination"
        style={styles.input}
        value={newDestination}
        onChangeText={setNewDestination}
      />
      <Button
        title="Add IntermediateDest"
        onPress={addIntermediateDestination}
      />
      <FlatList
        data={intermediateDestinations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
      <Button title="Create Trip" onPress={createTrip} />

      {/* Navigate to AssignTripScreen */}
      <Button
        title="Assign Trip"
        onPress={() => navigation.navigate("AssignTripScreen" as never)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, marginBottom: 12, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12 },
});

export default CreateTripScreen;
