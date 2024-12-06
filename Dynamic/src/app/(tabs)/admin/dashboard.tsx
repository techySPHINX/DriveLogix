import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";

const AdminDashboard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      <Card style={styles.card}>
        <Card.Title title="Drivers Managed" />
        <Card.Content>
          <Text style={styles.number}>120</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold" },
  card: { marginVertical: 10, padding: 20 },
  number: { fontSize: 32, fontWeight: "bold", color: "#4CAF50" },
});

export default AdminDashboard;
