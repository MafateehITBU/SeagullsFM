import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

function isDianaTitle(title) {
  return /diana/i.test(title ?? '');
}

export default function BeatProgramArtwork({ imageUrl, title, style, imageStyle }) {
  const diana = isDianaTitle(title);

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={require('../../assets/img/home/b-color.png')}
        style={styles.frame}
        resizeMode="contain"
      />
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.overlay, diana && styles.overlayDiana, imageStyle]}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlayDiana: {
    left: '6%',
    right: '6%',
    bottom: '6%',
    width: '88%',
    height: '88%',
  },
});
