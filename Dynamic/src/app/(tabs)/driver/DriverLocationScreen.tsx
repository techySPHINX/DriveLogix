import React, { useState, useEffect } from "react";
import { View, Button, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  updateDriverLocation,
  getDriverLocation,
} from "../../../services/locationgeofence";

const DriverLocationScreen = () => {
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);

  useEffect(() => {
    const fetchDriverLocation = async () => {
      const location = await getDriverLocation(1); // Using a fixed user ID for example
      setDriverLocation(location);
    };

    fetchDriverLocation();
  }, []);

  const handleUpdateLocation = async () => {
    const location = await updateDriverLocation(1, latitude, longitude); // Using a fixed user ID for example
    setDriverLocation(location);
    Alert.alert("Success", "Driver location updated!");
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Driver Location"
            description={`Lat: ${driverLocation.latitude}, Long: ${driverLocation.longitude}`}
          />
        )}
      </MapView>

      <View style={{ padding: 20 }}>
        <Button title="Update Driver Location" onPress={handleUpdateLocation} />
      </View>
    </View>
  );
};

export default DriverLocationScreen;
