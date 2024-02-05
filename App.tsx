import React from 'react';
import BleManager from 'react-native-ble-manager';

import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image source={require('./AeroTrace_Banner.png')} style={styles.banner} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Velocity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Altitude</Text>
        </TouchableOpacity>
        {/* Add more buttons as needed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 100, // Adjust the height as needed
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20, 
  },
  button: {
    backgroundColor: "#71dc71", 
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
