import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardTypeOptions,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const CreateTripScreen = () => {
  const [source, setSource] = useState("Chennai"); // Set default source to Chennai
  const [destination, setDestination] = useState("");
  const [tonnage, setTonnage] = useState("");
  const [intermediateDestinations, setIntermediateDestinations] = useState<
    string[]
  >([]);
  const [newDestination, setNewDestination] = useState("");
  const [trips, setTrips] = useState<any[]>([]);

  const navigation = useNavigation(); // Initialize navigation

  // Load stored trips when the component mounts
  useEffect(() => {
    const loadTrips = async () => {
      const storedTrips = await AsyncStorage.getItem("trips");
      if (storedTrips) {
        setTrips(JSON.parse(storedTrips));
      }
    };

    loadTrips();
  }, []);

  const addIntermediateDestination = () => {
    if (newDestination) {
      setIntermediateDestinations([
        ...intermediateDestinations,
        newDestination,
      ]);
      setNewDestination("");
    }
  };

  const createTrip = async () => {
    if (!source || !destination || !tonnage) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    const newTrip = {
      id: Date.now(),
      source,
      destination,
      tonnage: parseFloat(tonnage),
      intermediateDestinations,
    };

    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);

    // Persist trips in AsyncStorage
    await AsyncStorage.setItem("trips", JSON.stringify(updatedTrips));

    Alert.alert("Success", `Trip created successfully: Trip #${newTrip.id}`);

    // Navigate to AssignTripScreen only after trip is created
    navigation.navigate("AssignTripScreen" as never);
  };

  const renderFormFields = () => {
    return [
      {
        label: "Source",
        value: source,
        onChangeText: setSource,
        placeholder: "Enter Source",
      },
      {
        label: "Destination",
        value: destination,
        onChangeText: setDestination,
        placeholder: "Enter Destination",
      },
      {
        label: "Tonnage",
        value: tonnage,
        onChangeText: setTonnage,
        placeholder: "Enter Tonnage",
        keyboardType: "numeric" as KeyboardTypeOptions,
      },
      {
        label: "Intermediate Destinations",
        value: newDestination,
        onChangeText: setNewDestination,
        placeholder: "Add Intermediate Destination",
      },
    ];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Trip</Text>

      <FlatList
        data={renderFormFields()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
              placeholder={item.placeholder}
              style={styles.input}
              value={item.value}
              onChangeText={item.onChangeText}
              keyboardType={item.keyboardType}
            />
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={addIntermediateDestination}
            >
              <Text style={styles.buttonText}>
                Add Intermediate Destination
              </Text>
            </TouchableOpacity>

            {intermediateDestinations.length > 0 && (
              <FlatList
                data={intermediateDestinations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.destinationItem}>
                    <Text style={styles.destinationText}>{item}</Text>
                  </View>
                )}
              />
            )}

            <TouchableOpacity style={styles.button} onPress={createTrip}>
              <Text style={styles.buttonText}>Create Trip</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#004085",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#00509e",
    marginBottom: 8,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingLeft: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  footer: {
    marginTop: 30,
  },
  button: {
    backgroundColor: "#0066cc",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  destinationItem: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  destinationText: {
    fontSize: 16,
    color: "#003366",
  },
});

export default CreateTripScreen;
