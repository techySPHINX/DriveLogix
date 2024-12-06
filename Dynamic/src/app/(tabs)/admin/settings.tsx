import React from "react";
import { View, StyleSheet } from "react-native";
import { List, Button } from "react-native-paper";

const AdminSettings = () => {
  return (
    <View style={styles.container}>
      <List.Item
        title="Profile Settings"
        left={() => <List.Icon icon="account" />}
      />
      <List.Item title="App Settings" left={() => <List.Icon icon="cog" />} />
      <Button mode="contained" onPress={() => {}} style={styles.button}>
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  button: { marginTop: 20 },
});

export default AdminSettings;
