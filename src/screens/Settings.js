import { StyleSheet, Text, View} from 'react-native'
import React from 'react'

const Settings = () => {
    return (
        <View>
            <Text>Settings</Text>
        </View>
    )
}

export default Settings

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    smallText: {
        color: "#000000"
    }
})