import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Alert,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import {
  updateDriverLocation,
  getDriverLocation,
} from "../../../services/googleMapApi";
import { MaterialIcons } from "@expo/vector-icons";

const DriverLocationScreen = () => {
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sourceLocation, setSourceLocation] = useState({ latitude: 22.5726, longitude: 88.3639 }); // Kolkata
  const [destinationLocation, setDestinationLocation] = useState({ latitude: 22.5769, longitude: 88.427 }); // Example destination
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getDriverLocation(1) as { latitude: number; longitude: number };
        if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
          setDriverLocation(location);
        } else {
          throw new Error('Invalid location data');
        }
      } catch (error) {
        Alert.alert("Error", "Unable to fetch driver location");
      }
    };

    fetchLocation();

    const interval = setInterval(fetchLocation, 5000); // Fetch location every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const handleUpdateLocation = async () => {
    setLoading(true);
    try {
      const location = await updateDriverLocation(1, driverLocation?.latitude || 0, driverLocation?.longitude || 0) as { latitude: number; longitude: number };
      setDriverLocation(location);
      Alert.alert("Success", "Driver location updated!");
    } catch (error) {
      Alert.alert("Error", "Unable to update driver location");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 Driver Location</Text>
      {loading && (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      )}

      <MapView
        style={styles.mapContainer}
        initialRegion={{
          latitude: sourceLocation.latitude,
          longitude: sourceLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Source Marker */}
        <Marker
          coordinate={sourceLocation}
          title="Source"
          description="Start Point"
          pinColor="green"
        />

        {/* Destination Marker */}
        <Marker
          coordinate={destinationLocation}
          title="Destination"
          description="End Point"
          pinColor="blue"
        />

        {/* Driver Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver Location"
            description="Current Position"
          />
        )}

        {/* Line Between Source and Destination */}
        <Polyline
          coordinates={[sourceLocation, destinationLocation]}
          strokeColor="#FF0000" // Red line
          strokeWidth={2}
        />
      </MapView>

      <View style={styles.buttonContainer}>
        <Button
          title="Update Driver Location"
          onPress={handleUpdateLocation}
          color="#fff"
        />
      </View>

      <View style={styles.fabContainer}>
        <MaterialIcons
          name="location-on"
          size={40}
          color="#fff"
          onPress={handleUpdateLocation}
          style={styles.fab}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  mapContainer: {
    width: "100%",
    height: 400,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4,
  },
  loader: {
    marginVertical: 20,
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  fab: {
    backgroundColor: "#FF5722",
    padding: 15,
    borderRadius: 50,
    elevation: 5,
  },
});

export default DriverLocationScreen;
