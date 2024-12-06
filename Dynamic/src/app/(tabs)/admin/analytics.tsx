import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";

const AdminAnalytics = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Analytics</Text>
      <Button mode="contained" onPress={() => {}}>
        View Reports
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold" },
});

export default AdminAnalytics;
