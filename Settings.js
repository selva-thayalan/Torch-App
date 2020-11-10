import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Settings: () => React$Node = () =>{
    return(
        <View style={styles.container}>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"flex-start",
        alignItems:"center",
        backgroundColor:"white"
    },
})

Settings.options = {
    topBar:{
        title:{
            text:"Settings",
            color:"black"
        },
        background:{
            color:"gray"
        }
    }
}

export default Settings;