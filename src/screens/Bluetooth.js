import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import BleManager from 'react-native-ble-manager';

import { NativeEventEmitter, NativeModules } from 'react-native';
const { BleManagerModule } = NativeModules;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let BLEid = ''


const Bluetooth = () => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  const [NotificationOn, setNotificationOn] = useState(false);
  useEffect(() => {
    BleManager.start({ showAlert: false });

    return () => {
      BleManager.stopScan();
    };
  }, []);

  useEffect(() => {
    if (NotificationOn) {
      // Add listener for notifications
      const subscription = bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        ({ value, peripheral, characteristic, service }) => {
          // Convert base64 string to byte array
          const bytes = atob(value);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes.charCodeAt(i));
          }
          console.log('Received data from', peripheral, ':', binary);
        }
      );
  
      // Clean up the listener on component unmount
      return () => subscription.remove();
    }
  }, [NotificationOn]); // Re-run the effect when `NotificationOn` changes

  const startScan = () => {
    setScanning(true);
    BleManager.scan([], 2, true).then(() => {
      console.log('Scanning...');
    });
  
    setTimeout(() => {
      setScanning(false);
      BleManager.getDiscoveredPeripherals([]).then((results) => {
        // Filter out devices with name "UNKNOWN"
        const filteredResults = results.filter((device) => device.name != null);
        setDevices(filteredResults);
  
        // Log the name of each discovered device
        filteredResults.forEach((device) => {
          console.log(device.name);
        });
      });
    }, 10000);
  };
  
  const connectToDevice = (device) => {
    BleManager.connect(device.id).then(() => {
      BLEid = device.id;
      console.log('Connected to device:', device.name);
      BleManager.retrieveServices(device.id).then((peripheralInfo) => {
        console.log('Peripheral info:', peripheralInfo);
        const serviceUUID = 'adaf0001-4369-7263-7569-74507974686e';
        const characteristicUUID = 'adaf0003-4369-7263-7569-74507974686e';
        BleManager.startNotification(device.id, serviceUUID, characteristicUUID).then(() => {
          console.log('Notifications started');
          setNotificationOn(true); // This will cause a re-render
          NotificationOn = true;
        }).catch((error) => {
          console.log('Failed to start notifications:', error);
        });
      }).catch((error) => {
        console.log('Failed to retrieve peripheral services:', error);
      });
    }).catch((error) => {
      console.log('Failed to connect to device:', error);
    });
  };
  

  const renderItem = ({ item }) => (
    <Button
      title={`${item.name || 'Unknown'} (${item.id})`}
      onPress={() => connectToDevice(item)}
    />
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title={scanning ? 'Scanning...' : 'Start Scan'} onPress={startScan} disabled={scanning} />
      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Bluetooth;