import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { createGeofence, getGeofences } from "../../../services/locationgeofence";

const GeofenceManagementScreen = () => {
  const [geofences, setGeofences] = useState<any[]>([]);
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [radius, setRadius] = useState<number>(1000);
  const [timeLimit, setTimeLimit] = useState<number>(30);

  useEffect(() => {
    const fetchGeofences = async () => {
      const data = await getGeofences();
      setGeofences(data as any[]);
    };

    fetchGeofences();
  }, []);

  const handleCreateGeofence = async () => {
    const newGeofence = await createGeofence({
      latitude,
      longitude,
      radius,
      time_limit_minutes: timeLimit,
    });
    setGeofences((prev) => [...prev, newGeofence]);
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
        {geofences.map((geofence) => (
          <Marker
            key={geofence.id}
            coordinate={{
              latitude: geofence.latitude,
              longitude: geofence.longitude,
            }}
            title={geofence.name}
            description={`Radius: ${geofence.radius}m, Time limit: ${geofence.time_limit_minutes} min`}
          />
        ))}
      </MapView>

      <View style={{ padding: 20 }}>
        <TextInput
          placeholder="Latitude"
          keyboardType="numeric"
          value={String(latitude)}
          onChangeText={(text) => setLatitude(Number(text))}
        />
        <TextInput
          placeholder="Longitude"
          keyboardType="numeric"
          value={String(longitude)}
          onChangeText={(text) => setLongitude(Number(text))}
        />
        <TextInput
          placeholder="Radius"
          keyboardType="numeric"
          value={String(radius)}
          onChangeText={(text) => setRadius(Number(text))}
        />
        <TextInput
          placeholder="Time Limit (minutes)"
          keyboardType="numeric"
          value={String(timeLimit)}
          onChangeText={(text) => setTimeLimit(Number(text))}
        />
        <Button title="Create Geofence" onPress={handleCreateGeofence} />
      </View>
    </View>
  );
};

export default GeofenceManagementScreen;
