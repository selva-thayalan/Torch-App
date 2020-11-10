/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useRef } from 'react';
import {View,Text,StyleSheet,TouchableOpacity, Animated, TouchableWithoutFeedback, PermissionsAndroid, Alert} from 'react-native';
import Torch from 'react-native-torch';
import Slider from  '@react-native-community/slider';
import DefaultPreference from 'react-native-default-preference';
import ScreenBrightness from 'react-native-screen-brightness';
import { TriangleColorPicker, fromHsv } from 'react-native-color-picker';
import _ from 'lodash';
import { Navigation } from 'react-native-navigation';

const TORCH_MODE = {FRONT_SCREEN:0,BACK_LIGHT:1}

const App: () => React$Node = (props) => {

  const switchThumbPosition = useState(new Animated.ValueXY({x:0,y:0}))[0];
  const [torchState,setTorchState] = useState(false);
  const [torchMode,setTorchMode] = useState(0);
  const [intervalId,setIntervalId] = useState(null);
  const [isUIVisible,setIsUIVisible] = useState(true);
  const [frontColor,setFrontColor] = useState('white');
  const backLightTiming = useRef(0);
  const MAX_BRIGHTNESS = 255;

  const slide=()=>{
    if(torchMode === TORCH_MODE.FRONT_SCREEN){
      if(torchState){
        offFrontTorchState();
        slideOff();
        setTorchState(false);
      }
      else{
        onFrontTorchState();
      }
    }
    else{
      if(torchState){
        if(intervalId !== null)
          clearInterval(intervalId);
        Torch.switchState(false);
        slideOff();
        setTorchState(false);
      }
      else{
        if(intervalId !== null)
          clearInterval(intervalId);
        onBackTorchState(backLightTiming.current);
        slideOn();
        setTorchState(true);
      }
    }
  }

  const toggleTorchMode = () =>{
    if(torchMode === TORCH_MODE.FRONT_SCREEN){
      if(torchState){
        offFrontTorchState();
        if(intervalId !== null)
          clearInterval(intervalId);
        onBackTorchState(backLightTiming.current);
      }
      setTorchMode(TORCH_MODE.BACK_LIGHT);
    }
    else{
      if(torchState){
        onFrontTorchState();
        if(intervalId !== null)
          clearInterval(intervalId);
        Torch.switchState(false);
      }
      setTorchMode(TORCH_MODE.FRONT_SCREEN);
    }
  }

  const onBackTorchState = async(interval) =>{
    const isGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    if(isGranted){
      if(interval === 0){
        Torch.switchState(true);
        setIntervalId(null);
      }
      else{
        let tempState = true;
        setIntervalId(setInterval(()=>{
          Torch.switchState(tempState);
          tempState = !tempState;
        },(interval*100)));
      }
    }
    else{
      const req = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,{
        title:"Permission Needed",
        message:"This App required the camera function to work.",
        buttonPositive:"Ok",
        buttonNegative:"Cancel"
      });
      if(req !== PermissionsAndroid.RESULTS.GRANTED){
        Alert.alert("Permission Denied");
      }
    }
  }

  const onFrontTorchState = async() =>{
    const hasPerm = await ScreenBrightness.hasPermission();
    if(!hasPerm){
      ScreenBrightness.requestPermission();
      return;
    }
    else{
      ScreenBrightness.setAppBrightness(1);
      slideOn();
      setTorchState(true);
    }
  }

  const offFrontTorchState = async() =>{
    const sysBrightness = await ScreenBrightness.getSystemBrightness();
    let brightnessRangeValue =  (Math.min(MAX_BRIGHTNESS,sysBrightness)/MAX_BRIGHTNESS);
    ScreenBrightness.setAppBrightness(brightnessRangeValue);
  }

  function slideOn(){
    Animated.spring(switchThumbPosition,{
      toValue:{x:100,y:0},
      useNativeDriver:true
    }).start()
  }

  function slideOff(){
    Animated.spring(switchThumbPosition,{
      toValue:{x:0,y:0},
      useNativeDriver:true
    }).start()
  }

  const changeTheFrontColor=(color)=>{
    setFrontColor(fromHsv(color));
  }

  const onChangeFunc = _.debounce(color => changeTheFrontColor(color),500);

  const toggleIsUIVisible=()=>{
    setIsUIVisible(!isUIVisible);
    if(isUIVisible){
      switchThumbPosition.setValue({x:100,y:0});
    }
  }

  const updateBackLightTiming = (value) =>{
    backLightTiming.current = value;
    if(torchState){
      if(intervalId !== null)
        clearInterval(intervalId);
      onBackTorchState(value);
    }
  }

  const goToSettings = () =>{
    Navigation.push(props.componentId,{
      component:{
        name:'Settings'
      }
    })
  }

  return (
      <View style={[styles.container,{backgroundColor:(torchState && (torchMode === TORCH_MODE.FRONT_SCREEN))?frontColor:'white'}]}
      onStartShouldSetResponder={()=>{return (torchState && (torchMode === TORCH_MODE.FRONT_SCREEN)) ? true : false }}
      onResponderRelease={toggleIsUIVisible}>
        {isUIVisible ? <View style={[styles.UIContainer]}>
          {torchMode===TORCH_MODE.FRONT_SCREEN ? null :
          <Slider
          minimumValue={0}
          maximumValue={6}
          step={1}
          onSlidingComplete={updateBackLightTiming}
          value={backLightTiming.current}
          style={{height:20,width:300}}/>}
          <View style={styles.flashSwitchTrack}>
            <Animated.View style={[switchThumbPosition.getTranslateTransform(),styles.flashSwitch]}>
              <TouchableWithoutFeedback onPress={slide}>
                <View style={{flex:1,backgroundColor:"black",borderRadius:100}}>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </View>
          <TriangleColorPicker style={{flex:0,height:200,width:200,backgroundColor:'gray',borderRadius:200}}
            hideControls={true}
            defaultColor={frontColor}
            onColorChange={ onChangeFunc }/>
          <TouchableOpacity style={styles.Button} onPress={toggleTorchMode}>
            <Text>{torchMode === TORCH_MODE.FRONT_SCREEN ? "back" : "front"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.Button} onPress={goToSettings}>
            <Text>Settings</Text>
          </TouchableOpacity>
        </View> : null}
      </View>
  );
};

const styles= StyleSheet.create({
  container:{
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  },
  UIContainer:{
    flex:1,
    alignItems:"center",
    justifyContent:'space-around'
  },
  Button:{
    height:50,
    width:100,
    borderRadius:10,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"#BEBEBE",
    marginBottom:10
  },
  flashSwitch:{
    height:100,
    width:100,
    borderRadius:100,
    backgroundColor:'white'
  },
  flashSwitchTrack:{
    height:100,
    width:200,
    backgroundColor:'gray',
    justifyContent:'center',
    alignContent:'center',
    borderRadius:100
  }
});

export default App;
