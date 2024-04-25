import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import BleManager from 'react-native-ble-manager';

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
    BleManager.scan([], 10, true).then(() => {
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
    BleManager.connect(device.id).then(() => {
      console.log('Connected to', device.name);
      BleManager.retrieveServices(device.id).then((peripheralInfo) => {
        console.log('Peripheral info:', peripheralInfo);
        
        if (peripheralInfo.services && peripheralInfo.services.length > 0) { // Check if services array exists and is not empty
          // Look for the service UUID you're interested in
          const serviceUUID = 'adaf0001-4369-7263-7569-74507974686e';
          const characteristicUUID = 'adaf0003-4369-7263-7569-74507974686e';
          
          // Find the service that matches the UUID
          const service = peripheralInfo.services.find((s) => s.uuid === serviceUUID);
          
          if (service) {
            // Check if characteristics array exists and is not empty
            if (service.characteristics && service.characteristics.length > 0) {
              // Find the characteristic within the service
              const characteristic = service.characteristics.find((c) => c.characteristic === characteristicUUID);
              
              if (characteristic) {
                // Enable notifications for the characteristic
                BleManager.startNotification(device.id, serviceUUID, characteristicUUID)
                  .then(() => {
                    console.log('Notifications started');
                    
                    // Listen for notifications
                    BleManager.onNotification(device.id, serviceUUID, characteristicUUID, (data) => {
                      console.log('Notification:', data);
                      // You can handle the received notification data here
                    });
                  })
                  .catch((error) => {
                    console.error('Notification error', error);
                  });
              } else {
                console.error('Characteristic not found');
              }
            } else {
              console.error('No characteristics found in the service');
            }
          } else {
            console.error('Service not found');
          }
        } else {
          console.error('No services found');
        }
      });
    }).catch((error) => {
      console.error('Connection error', error);
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