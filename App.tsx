import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import tw from 'twrnc';

export default function App() {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text style={tw`font-bold`}>asdjkhkjh</Text>
      <StatusBar style="auto" />
    </View>
  );
}
