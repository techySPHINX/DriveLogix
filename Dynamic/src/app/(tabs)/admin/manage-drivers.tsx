import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { List, Button } from "react-native-paper";

const drivers = [
  { id: 1, name: "John Doe", status: "Active" },
  { id: 2, name: "Jane Smith", status: "Pending" },
];

const ManageDrivers = () => {
  return (
    <FlatList
      data={drivers}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          description={`Status: ${item.status}`}
          right={() => <Button mode="text">Edit</Button>}
        />
      )}
    />
  );
};

export default ManageDrivers;
