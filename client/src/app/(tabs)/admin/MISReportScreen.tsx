import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

const MISReportScreen = () => {
  const fuelConsumptionData = [
    { month: "Jan", consumption: 5200 },
    { month: "Feb", consumption: 4800 },
    { month: "Mar", consumption: 5100 },
    { month: "Apr", consumption: 5300 },
    { month: "May", consumption: 5600 },
    { month: "Jun", consumption: 5400 },
  ];

  const drivers = [
    { name: "Rajesh Kumar", rating: 4.8, completedDeliveries: 152 },
    { name: "Priya Singh", rating: 4.7, completedDeliveries: 98 },
    { name: "Amit Patel", rating: 4.9, completedDeliveries: 203 },
    { name: "Sunita Sharma", rating: 4.6, completedDeliveries: 87 },
  ];

  const reports = [
    {
      title: "Fleet Performance Report",
      description: "Overview of fleet utilization and efficiency",
      chart: (
        <BarChart
          data={{
            labels: ["VH001", "VH002", "VH003"],
            datasets: [{ data: [8.5, 9.2, 7.8] }],
          }}
          width={350}
          height={200}
          yAxisLabel=""
          yAxisSuffix=" km/L"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ),
    },
    {
      title: "Fuel Consumption Report",
      description: "Monthly fuel consumption analysis",
      chart: (
        <LineChart
          data={{
            labels: fuelConsumptionData.map((item) => item.month),
            datasets: [
              { data: fuelConsumptionData.map((item) => item.consumption) },
            ],
          }}
          width={350}
          height={200}
          yAxisLabel=""
          yAxisSuffix="L"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ),
    },
    {
      title: "Driver Performance Report",
      description: "Overview of driver ratings and completed deliveries",
      chart: (
        <BarChart
          data={{
            labels: drivers.map((driver) => driver.name),
            datasets: [
              { data: drivers.map((driver) => driver.completedDeliveries) },
            ],
          }}
          width={350}
          height={200}
          yAxisLabel=""
          yAxisSuffix=" Deliveries"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ),
    },
    {
      title: "Route Optimization Report",
      description: "Analysis of most efficient routes",
      chart: (
        <BarChart
          data={{
            labels: [
              "Mumbai - Delhi",
              "Bangalore - Chennai",
              "Kolkata - Hyderabad",
            ],
            datasets: [{ data: [92, 95, 88] }],
          }}
          width={350}
          height={200}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ),
    },
    {
      title: "Carbon Footprint Report",
      description: "Analysis of CO2 emissions from our fleet",
      chart: (
        <LineChart
          data={{
            labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [{ data: [45.2, 42.8, 48.1, 44.5, 46.3, 43.7] }],
          }}
          width={350}
          height={200}
          yAxisLabel=""
          yAxisSuffix=" tons CO2"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ),
    },
    {
      title: "Truck Health Report",
      description: "Overview of truck maintenance and performance",
      chart: (
        <BarChart
          data={{
            labels: ["TN-01-AB-1234", "MH-02-CD-5678", "KA-03-EF-9012"],
            datasets: [{ data: [92, 88, 95] }],
          }}
          width={350}
          height={200}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {reports.map((report, index) => (
        <View key={index} style={styles.reportContainer}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDescription}>{report.description}</Text>
          <View>{report.chart}</View>
        </View>
      ))}
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(34, 167, 240, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  reportContainer: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reportDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  chart: {
    marginVertical: 10,
  },
});

export default MISReportScreen;
