/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import News from './App/Screens/News';
import {SafeAreaView} from 'react-native';
import {NewsProvider} from './App/Context/NewsContext';

function App(): JSX.Element {
  return (
    <NewsProvider>
      <SafeAreaView style={{flex: 1}}>
        <News />
      </SafeAreaView>
    </NewsProvider>
  );
}

export default App;
