import { Alert, Linking } from 'react-native';

export async function openExternalUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Unable to open link', 'Please try again in a moment.');
  }
}
