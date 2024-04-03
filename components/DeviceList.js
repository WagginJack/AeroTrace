/* eslint-disable react-native/no-inline-styles */
import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';

export const DeviceList = ({peripheral, connect, disconnect}) => {
  const {name, rssi, connected} = peripheral;

  return (
    <>
      {name && (
        <View >
          <View >
            <Text >{name}</Text>
            <Text >RSSI: {rssi}</Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              connected ? disconnect(peripheral) : connect(peripheral)
            }
            >
            <Text
              >
              {connected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};