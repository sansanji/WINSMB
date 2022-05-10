/* *
 * Import Common
 * */
import { Text, StyleSheet } from 'react-native';
/* *
 * Import node_modules
 * */
import React from 'react';
/**
 * 뱃지 컴포넌트
 */
const Component = props => <Text style={styles.badge}>{props.children}</Text>;

const styles = StyleSheet.create({
  badge: {
    width: 30,
    alignSelf: 'flex-end',
    textAlign: 'center',
    fontSize: 12,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 10,
    color: '#ffffff',
    backgroundColor: '#FF5B49',
  },
});

export default Component;
