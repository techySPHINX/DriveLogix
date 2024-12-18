import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

const SplashScreen: React.FC = () => {
 const [logoOpacity] = useState(new Animated.Value(0));

 useEffect(() => {
  Animated.timing(logoOpacity, {
   toValue: 1,
   duration: 2000,
   useNativeDriver: true,
  }).start();
 }, []);

 return (
  <View style={styles.container}>
   <Animated.Image
    source={require('../../../../assets/logo.png')}
    style={[styles.logo, { opacity: logoOpacity }]}
   />
   <Text style={styles.text}>Welcome to Logistic App</Text>
  </View>
 );
};

const styles = StyleSheet.create({
 container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fff',
 },
 logo: {
  width: 150,
  height: 150,
  marginBottom: 20,
 },
 text: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333',
 },
});

export default SplashScreen;
