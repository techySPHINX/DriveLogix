import React, { useState, useEffect } from "react";
import { View, Button, Alert } from "react-native";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import {
  updateDriverLocation,
  getDriverLocation,
} from "../../../services/locationgeofence";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const DriverLocationScreen = () => {
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);

  useEffect(() => {
    const fetchDriverLocation = async () => {
      const location = await getDriverLocation(1);
      setDriverLocation(location);
    };

    fetchDriverLocation();
  }, []);

  const handleUpdateLocation = async () => {
    const location = await updateDriverLocation(1, latitude, longitude);
    setDriverLocation(location);
    Alert.alert("Success", "Driver location updated!");
  };

  return (
    <View style={{ flex: 1 }}>
      <LoadScript googleMapsApiKey="AIzaSyDrF8zFKWIDqUqVRvBueIWN5Ib70ga3hUc">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: latitude, lng: longitude }}
          zoom={10}
        >
          {driverLocation && (
            <Marker
              position={{
                lat: driverLocation.latitude,
                lng: driverLocation.longitude,
              }}
              title="Driver Location"
            />
          )}
        </GoogleMap>
      </LoadScript>

      <View
        style={{ padding: 20, position: "absolute", bottom: 0, width: "100%" }}
      >
        <Button title="Update Driver Location" onPress={handleUpdateLocation} />
      </View>
    </View>
  );
};

export default DriverLocationScreen;
