import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Button, Icon, Input } from "@rneui/themed";

const DriverHomeScreen = () => {
  const [numIntermediates, setNumIntermediates] = useState<string>("");
  const [intermediatePincodes, setIntermediatePincodes] = useState<string[]>([]);
  const [destinationPincode, setDestinationPincode] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [geocodeStatus, setGeocodeStatus] = useState<string>("");
  const [route, setRoute] = useState<{ lat: number; lng: number }[] | null>(null);
  const [intermediateWarehouses, setIntermediateWarehouses] = useState<any[]>([]);

  const API_KEY = "AIzaSyDj3vJGnYx52KENC7svMfzp2O56Uty2fr8";

  useEffect(() => {
    initializeGeolocation();
  }, []);

  const initializeGeolocation = async () => {
    if (Platform.OS === "android") {
      await requestLocationPermission();
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("Current location found! Ready to route.");
      },
      (error) => {
        setLocationStatus(
          "Location access denied. Please enable location permissions."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 30000,
      }
    );
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location",
          buttonPositive: "OK",
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const addIntermediateFields = () => {
    const numIntermediatesValue = parseInt(numIntermediates);
    const newIntermediatePincodes = [];
    const newIntermediateWarehouses = [];
    for (let i = 0; i < numIntermediatesValue; i++) {
      newIntermediatePincodes.push("");
      newIntermediateWarehouses.push({
        load: Math.floor(Math.random() * 500) + 100,
        distance: Math.random() * 100,
      });
    }
    setIntermediatePincodes(newIntermediatePincodes);
    setIntermediateWarehouses(newIntermediateWarehouses);
  };

  const geocodePincode = async (pincode: string) => {
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode},India&key=${API_KEY}`;
    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setGeocodeStatus(`Geocoded ${pincode} successfully`);
        return { lat: location.lat, lng: location.lng };
      } else {
        setGeocodeStatus(`Geocoding failed for ${pincode}`);
        throw new Error("Geocoding failed");
      }
    } catch (error) {
      setGeocodeStatus(`Geocoding error: ${(error as Error).message}`);
      throw error;
    }
  };

  const createRoute = async (option: string) => {
    const intermediates = intermediateWarehouses.map((warehouse, index) => ({
      pincode: intermediatePincodes[index],
      load: warehouse.load,
      distance: warehouse.distance,
    }));

    let selectedPoints: any[] = [];

    if (option === "shortest-distance") {
      intermediates.sort((a, b) => a.distance - b.distance);
      selectedPoints = intermediates.slice(0, intermediates.length);
    }

    try {
      const destination = await geocodePincode(destinationPincode);
      const waypoints = await Promise.all(
        selectedPoints.map(async (point) => await geocodePincode(point.pincode))
      );
      const routePoints = [currentLocation, ...waypoints, destination].filter(point => point !== null);
      setRoute(routePoints);
    } catch (error) {
      console.log("Failed to create route:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>Dynamic Routing</Card.Title>
          <Card.Divider />
          <Input
            placeholder="Enter number of intermediate points"
            value={numIntermediates}
            onChangeText={setNumIntermediates}
            keyboardType="numeric"
          />
          <Button
            title="Add Intermediate Points"
            buttonStyle={styles.button}
            onPress={addIntermediateFields}
          />
          {intermediatePincodes.map((pincode, index) => (
            <Input
              key={index}
              placeholder={`Enter Intermediate Pin Code ${index + 1}`}
              value={pincode}
              onChangeText={(text) => {
                const newPincodes = [...intermediatePincodes];
                newPincodes[index] = text;
                setIntermediatePincodes(newPincodes);
              }}
            />
          ))}
          <Input
            placeholder="Enter Destination Pin Code"
            value={destinationPincode}
            onChangeText={setDestinationPincode}
          />
          <Button
            title="Shortest Distance Route"
            buttonStyle={styles.button}
            onPress={() => createRoute("shortest-distance")}
          />
        </Card>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{locationStatus}</Text>
          <Text style={styles.statusText}>{geocodeStatus}</Text>
        </View>

        {route && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation ? currentLocation.lat : 13.0827,
              longitude: currentLocation ? currentLocation.lng : 80.2707,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {route.map((point, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: point.lat,
                  longitude: point.lng,
                }}
                title={`Point ${index + 1}`}
              />
            ))}
            <Polyline
              coordinates={route.map((point) => ({
                latitude: point.lat,
                longitude: point.lng,
              }))}
              strokeColor="blue"
              strokeWidth={6}
            />
          </MapView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    marginTop: 10,
  },
  statusContainer: {
    margin: 20,
  },
  statusText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    },
    map: {
    height: 400,
    margin: 20,
    },
  });
  
  export default DriverHomeScreen;









