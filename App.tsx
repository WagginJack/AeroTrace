import React from 'react';
import BleManager from 'react-native-ble-manager';


import { View, StyleSheet, TouchableOpacity, Image, Text, Platform, Dimensions} from 'react-native';

const App: React.FC = () => {
  return (
    <View style={[styles.container,
    
      { 
        marginTop: Platform.OS === "ios" ? 40 : 0 
      }
    
    ]}>
      <Image source={require('./AeroTrace_Banner2.png')} style={styles.banner} />
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
    
    width: Dimensions.get('window').width, //width is the width of the window size
    height: 347 * (Dimensions.get('window').width)/1660, //height is the actual pixel height times the ratio
     // Adjust the height as needed
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
