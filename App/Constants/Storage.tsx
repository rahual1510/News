import {Alert, Linking} from 'react-native';
import {MMKV} from 'react-native-mmkv';

export const newsStorage = new MMKV();

export const openUrl = async (url: String) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert(`Don't know how to open this URL: ${url}`);
  }
};
