import React, { useState, useEffect } from 'react';
import {
  Text,
  Alert,
  ScrollView,
  View,
  FlatList,
  Platform,
  StatusBar,
  SafeAreaView,
  NativeModules,
  useColorScheme,
  TouchableOpacity,
  NativeEventEmitter,
  PermissionsAndroid,
  StyleSheet,
  Dimensions,
} from 'react-native';
import BleManager from 'react-native-ble-manager';//still planning to use PLX Instead of this today
import { DeviceList } from '../../components/DeviceList';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BLEService = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const BLERead = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";

connect(peripheralId) {
  return new Promise((fulfill, reject) => {
      bleManager.connect(peripheralId, (error) => {
          if (error) {
              reject(error);
          } else {
              fulfill();
          }
      });
  });
}

disconnect(peripheralId) {
  return new Promise((fulfill, reject) => {
      bleManager.disconnect(peripheralId, (error) => {
          if (error) {
              reject(error);
          } else {
              fulfill();
          }
      });
  });
}

read(peripheralId, serviceUUID, characteristicUUID) {
  return new Promise((fulfill, reject) => {
      BleManager.read(peripheralId, serviceUUID, characteristicUUID, (error, data) => {
          if (error) {
              reject(error);
          } else {
              fulfill(data);
          }
      });
  });
}

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{ pdadingHorizontal: 20 }}>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? Colors.white : Colors.black },
          ]}>
          Bluetooth Connect
        </Text>
        <TouchableOpacity
          onPress={scan}
          activeOpacity={0.5}
          style={styles.scanButton}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.subtitle,
            { color: isDarkMode ? Colors.white : Colors.black },
          ]}>
          Discovered Devices:
        </Text>
        {discoveredDevices.length > 0 ? (
          <FlatList
          style={styles.FlatList}
            data={discoveredDevices}
            renderItem={({ item }) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={styles.noDevicesText}>No Bluetooth devices found</Text>
        )}

        <Text
          style={[
            styles.subtitle,
            { color: isDarkMode ? Colors.white : Colors.black },
          ]}>
          Connected Devices:
        </Text>
        {connectedDevices.length > 0 ? (
          <FlatList
          style={styles.FlatList}
            data={connectedDevices}
            renderItem={({ item }) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={styles.noDevicesText}>No connected devices</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Bluetooth;

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: windowHeight,
    paddingHorizontal: 10,
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 10,
    marginTop: 20,
  },
  scanButton: {
    backgroundColor: '#71dc71',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  noDevicesText: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  FlatList: {
    maxHeight: 150,
  }
})