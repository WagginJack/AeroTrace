import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter } from 'react-native'; //test
const bleManagerEmitter = new NativeEventEmitter(BleManager); //test

const Bluetooth = () => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    BleManager.start({ showAlert: false });

    return () => {
      BleManager.stopScan();
    };
  }, []);

  const startScan = () => {
    setScanning(true);
    BleManager.scan([], 5, true).then(() => {
      console.log('Scanning...');
    });
  
    setTimeout(() => {
      setScanning(false);
      BleManager.getDiscoveredPeripherals([]).then((results) => {
        // Filter out devices with name "UNKNOWN"
        const filteredResults = results.filter((device) => device.name !== null);
        setDevices(filteredResults);
  
        // Log the name of each discovered device
        filteredResults.forEach((device) => {
          console.log(device.name);
        });
      });
    }, 10000);
  };
  
  const connectToDevice = (device) => {
    BleManager.connect(device.id)
      .then(() => {
        return BleManager.retrieveServices(device.id);
      })
      .then((peripheralInfo) => {
        // Assuming the service and characteristic UUIDs
        const serviceUUID = 'adaf0001-4369-7263-7569-74507974686e';
        const characteristicUUID = 'adaf0003-4369-7263-7569-74507974686e';

        // Start notifications
        return BleManager.startNotification(device.id, serviceUUID, characteristicUUID);
      })
      .then(() => {
        // Add listener for notifications
        bleManagerEmitter.addListener(
          'BleManagerDidUpdateValueForCharacteristic',
          ({ value, peripheral, characteristic, service }) => {
            // Convert bytes array to string
            const data = Buffer.from(value, 'base64').toString('ascii');
            console.log('Received data from', peripheral, ':', data);
          }
        );
      })
      .catch((error) => {
        console.error(error);
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