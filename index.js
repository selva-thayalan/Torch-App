import {Navigation} from 'react-native-navigation';
import App from './App';
import Settings from './Settings';

Navigation.registerComponent('Home', () => App);
Navigation.registerComponent('Settings', () => Settings);
Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
        root: {
            stack: {
                id:'Flash',
                children: [
                    {
                        component: {
                            name: 'Home',
                            options:{
                                topBar:{
                                    visible:false
                                }
                            }
                        }
                    }
                ]
            }
        }
    });
});