import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import {
  getGeofencesFromStorage,
  saveGeofencesToStorage,
} from "../storageUtils";

// Function to create a geofence (mock API)
const createGeofence = async ({
  latitude,
  longitude,
  radius,
}: {
  latitude: number;
  longitude: number;
  radius: number;
}) => {
  return new Promise<{
    id: number;
    latitude: number;
    longitude: number;
    radius: number;
  }>((resolve) => {
    setTimeout(() => {
      const newGeofence = {
        id: Date.now(),
        latitude,
        longitude,
        radius,
      };
      resolve(newGeofence);
    }, 500);
  });
};

type Geofence = {
  id: number;
  latitude: number;
  longitude: number;
  radius: number;
};

const GeofenceManagementScreen: React.FC = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [latitude, setLatitude] = useState<string>("22.5726"); // Default: Kolkata
  const [longitude, setLongitude] = useState<string>("88.3639");
  const [radius, setRadius] = useState<string>("1000"); // Default radius in meters
  const [editGeofenceId, setEditGeofenceId] = useState<number | null>(null); // Track editing state
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch geofences from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchGeofencesList = async () => {
      try {
        const fetchedGeofences = await getGeofencesFromStorage();
        setGeofences(fetchedGeofences);
      } catch (error) {
        console.error("Error fetching geofences:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGeofencesList();
  }, []);

  // Handle saving geofences (create or update)
  const handleSaveGeofence = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (!lat || !lng || !rad) {
      Alert.alert("Error", "Please provide all geofence details.");
      return;
    }

    try {
      let updatedGeofences;

      if (editGeofenceId !== null) {
        // Edit existing geofence
        updatedGeofences = geofences.map((geofence) =>
          geofence.id === editGeofenceId
            ? {
                ...geofence,
                latitude: lat,
                longitude: lng,
                radius: rad,
              }
            : geofence
        );
      } else {
        // Create new geofence
        const newGeofence = await createGeofence({
          latitude: lat,
          longitude: lng,
          radius: rad,
        });
        updatedGeofences = [...geofences, newGeofence];
      }

      // Save the updated geofences
      await saveGeofencesToStorage(updatedGeofences);
      setGeofences(updatedGeofences); // Update the state directly
      Alert.alert("Success", "Geofence saved successfully!");
      resetForm();
    } catch (error) {
      console.error("Error saving geofence:", error);
      Alert.alert("Error", "Failed to save geofence.");
    }
  };

  // Handle editing a geofence
  const handleEditGeofence = (geofence: Geofence) => {
    setLatitude(String(geofence.latitude));
    setLongitude(String(geofence.longitude));
    setRadius(String(geofence.radius));
    setEditGeofenceId(geofence.id);
  };

  // Handle deleting a geofence
  const handleDeleteGeofence = (id: number) => {
    const updatedGeofences = geofences.filter((geofence) => geofence.id !== id);
    setGeofences(updatedGeofences);
    saveGeofencesToStorage(updatedGeofences); // Save the updated geofences after deletion
    Alert.alert("Success", "Geofence deleted successfully!");
    resetForm();
  };

  // Reset the form to its initial state
  const resetForm = () => {
    setLatitude("22.5726");
    setLongitude("88.3639");
    setRadius("1000");
    setEditGeofenceId(null);
  };

  if (loading) {
    return <Text>Loading geofences...</Text>; // Show loading message or spinner
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <MapView
          style={styles.map}
          region={{
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker
            coordinate={{
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            }}
            title="Central Location"
            description={`Lat: ${latitude}, Lng: ${longitude}`}
          />
          {geofences.map((geofence) => (
            <React.Fragment key={geofence.id}>
              <Marker
                coordinate={{
                  latitude: geofence.latitude,
                  longitude: geofence.longitude,
                }}
                title={`Geofence: ${geofence.radius} meters`}
                onPress={() => handleEditGeofence(geofence)}
              />
              <Circle
                center={{
                  latitude: geofence.latitude,
                  longitude: geofence.longitude,
                }}
                radius={geofence.radius}
                strokeColor="red"
                fillColor="rgba(255, 0, 0, 0.2)"
              />
            </React.Fragment>
          ))}
        </MapView>
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Latitude"
            keyboardType="numeric"
            value={latitude}
            onChangeText={setLatitude}
            style={styles.input}
          />
          <TextInput
            placeholder="Longitude"
            keyboardType="numeric"
            value={longitude}
            onChangeText={setLongitude}
            style={styles.input}
          />
          <TextInput
            placeholder="Radius (meters)"
            keyboardType="numeric"
            value={radius}
            onChangeText={setRadius}
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleSaveGeofence}>
            <Text style={styles.buttonText}>
              {editGeofenceId ? "Update Geofence" : "Create Geofence"}
            </Text>
          </TouchableOpacity>

          {editGeofenceId && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDeleteGeofence(editGeofenceId)}
              >
                <Text style={styles.buttonText}>Delete Geofence</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#ff4d4d",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default GeofenceManagementScreen;
