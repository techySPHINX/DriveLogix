// GeofenceManagementScreen.tsx
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
  getAllGeofencesAsText,
} from "../storageUtils";

type Geofence = {
  id: number;
  latitude: number;
  longitude: number;
  radius: number;
};

const GeofenceManagementScreen = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [latitude, setLatitude] = useState("22.5726"); // Default: Kolkata
  const [longitude, setLongitude] = useState("88.3639");
  const [radius, setRadius] = useState("1000"); // Default radius in meters
  const [editGeofenceId, setEditGeofenceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeofencesList = async () => {
      try {
        const fetchedGeofences: Geofence[] = await getGeofencesFromStorage();
        setGeofences(fetchedGeofences);
      } catch (error) {
        console.error("Error fetching geofences:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGeofencesList();
  }, []);

  const handleSaveGeofence = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (!lat || !lng || !rad) {
      Alert.alert("Error", "Please provide all geofence details.");
      return;
    }

    try {
      let updatedGeofences: Geofence[];

      if (editGeofenceId !== null) {
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
        const newGeofence: Geofence = {
          id: Date.now(),
          latitude: lat,
          longitude: lng,
          radius: rad,
        };
        updatedGeofences = [...geofences, newGeofence];
      }

      await saveGeofencesToStorage(updatedGeofences);
      setGeofences(updatedGeofences);
      Alert.alert("Success", "Geofence saved successfully!");
      resetForm();
    } catch (error) {
      console.error("Error saving geofence:", error);
      Alert.alert("Error", "Failed to save geofence.");
    }
  };

  const handleDeleteGeofence = (id: number) => {
    const updatedGeofences = geofences.filter((geofence) => geofence.id !== id);
    setGeofences(updatedGeofences);
    saveGeofencesToStorage(updatedGeofences);
    Alert.alert("Success", "Geofence deleted successfully!");
    resetForm();
  };

  const handleDeleteGeofenceByInput = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseInt(radius, 10);

    if (!lat || !lng || !rad) {
      Alert.alert("Error", "Please provide valid latitude, longitude, and radius.");
      return;
    }

    const matchingGeofence = geofences.find(
      (geofence) =>
        geofence.latitude === lat &&
        geofence.longitude === lng &&
        geofence.radius === rad
    );

    if (matchingGeofence) {
      handleDeleteGeofence(matchingGeofence.id);
    } else {
      Alert.alert("Error", "No matching geofence found.");
    }
  };

  const handleGetAllGeofences = async () => {
    try {
      const geofencesText = await getAllGeofencesAsText();
      Alert.alert("All Geofences", geofencesText);
    } catch (error) {
      console.error("Error fetching all geofences:", error);
      Alert.alert("Error", "Failed to retrieve geofences.");
    }
  };

  const resetForm = () => {
    setLatitude("22.5726");
    setLongitude("88.3639");
    setRadius("1000");
    setEditGeofenceId(null);
  };

  if (loading) {
    return <Text>Loading geofences...</Text>;
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

          {editGeofenceId ? (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeleteGeofenceByInput}
            >
              <Text style={styles.buttonText}>Delete Geofence</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#28a745" }]}
            onPress={handleGetAllGeofences}
          >
            <Text style={styles.buttonText}>Get All Geofences</Text>
          </TouchableOpacity>
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
    },
    input: {
      height: 40,
      borderColor: "gray",
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    button: {
      backgroundColor: "#007bff",
      padding: 10,
      alignItems: "center",
      marginBottom: 10,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
    },
    cancelButton: {
      backgroundColor: "#6c757d",
    },
    deleteButton: {
      backgroundColor: "#dc3545",
    },
  });
  
  export default GeofenceManagementScreen;





























