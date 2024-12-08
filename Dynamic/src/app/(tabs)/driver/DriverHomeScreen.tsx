import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useNavigation } from "@react-navigation/native";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const DriverHomeScreen = () => {
  const navigation = useNavigation(); 
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [sourceCoords, setSourceCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default center (San Francisco)

  const handleGetRoute = () => {
    if (!source || !destination) {
      alert("Please enter both source and destination.");
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: source,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);

          // Extract coordinates for source and destination markers
          if (result && result.routes && result.routes[0] && result.routes[0].legs && result.routes[0].legs[0]) {
            const { lat: startLat, lng: startLng } =
              result.routes[0].legs[0].start_location;
            const { lat: endLat, lng: endLng } =
              result.routes[0].legs[0].end_location;

            setSourceCoords({ lat: startLat(), lng: startLng() });
            setDestinationCoords({ lat: endLat(), lng: endLng() });

            // Re-center map to source location
            setMapCenter({ lat: startLat(), lng: startLng() });
          } else {
            alert("Could not fetch directions. Please check the locations.");
          }
        } else {
          alert("Could not fetch directions. Please check the locations.");
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Home Screen</Text>

      {/* Input fields for source and destination */}
      <TextInput
        style={styles.input}
        placeholder="Enter Source Location"
        value={source}
        onChangeText={setSource}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Destination Location"
        value={destination}
        onChangeText={setDestination}
      />

      {/* Button to fetch the route */}
      <Button title="Get Route" onPress={handleGetRoute} />

      {/* Google Map */}
      <LoadScript googleMapsApiKey="AIzaSyDrF8zFKWIDqUqVRvBueIWN5Ib70ga3hUc">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={10}
        >
          {/* Markers for source and destination */}
          {sourceCoords && <Marker position={sourceCoords} label="Source" />}
          {destinationCoords && (
            <Marker position={destinationCoords} label="Destination" />
          )}

          {/* Directions Renderer */}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>

      {/* Navigation Button */}
      <Button
        title="Go to Trips"
        onPress={() => navigation.navigate("TripScreen" as never)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

export default DriverHomeScreen;
