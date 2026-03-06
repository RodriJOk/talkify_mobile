import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useLanguage } from '@/providers/LanguageProvider';

export default function TabTwoScreen() {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          {isEs ? 'Explorar' : 'Explore'}
        </ThemedText>
      </ThemedView>
      <ThemedText>
        {isEs
          ? 'Esta pantalla incluye ejemplos para ayudarte a comenzar.'
          : 'This screen includes example code to help you get started.'}
      </ThemedText>
      <Collapsible title={isEs ? 'Enrutado por archivos' : 'File-based routing'}>
        <ThemedText>
          {isEs ? 'Esta app tiene dos pantallas:' : 'This app has two screens:'}{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          {isEs ? 'El archivo de layout en ' : 'The layout file in '}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          {isEs ? 'configura el navegador de tabs.' : 'sets up the tab navigator.'}
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">{isEs ? 'Ver más' : 'Learn more'}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={isEs ? 'Soporte Android, iOS y web' : 'Android, iOS, and web support'}>
        <ThemedText>
          {isEs
            ? 'Puedes abrir este proyecto en Android, iOS y web. Para abrir la versión web, presiona '
            : 'You can open this project on Android, iOS, and the web. To open the web version, press '}
          <ThemedText type="defaultSemiBold">w</ThemedText>
          {isEs ? ' en la terminal donde ejecutas este proyecto.' : ' in the terminal running this project.'}
        </ThemedText>
      </Collapsible>
      <Collapsible title={isEs ? 'Imágenes' : 'Images'}>
        <ThemedText>
          {isEs ? 'Para imágenes estáticas, puedes usar los sufijos ' : 'For static images, you can use the '}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText>
          {isEs ? ' para distintos niveles de densidad de pantalla.' : ' suffixes to provide files for different screen densities.'}
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">{isEs ? 'Ver más' : 'Learn more'}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={isEs ? 'Componentes modo claro/oscuro' : 'Light and dark mode components'}>
        <ThemedText>
          {isEs ? 'Esta plantilla soporta modo claro y oscuro. El hook ' : 'This template has light and dark mode support. The '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText>
          {isEs
            ? ' te permite detectar el esquema de color actual del usuario para ajustar la UI.'
            : ' hook lets you inspect what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.'}
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">{isEs ? 'Ver más' : 'Learn more'}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={isEs ? 'Animaciones' : 'Animations'}>
        <ThemedText>
          {isEs ? 'Esta plantilla incluye un ejemplo de componente animado. El componente ' : 'This template includes an example of an animated component. The '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText>
          {isEs ? ' usa la potente librería ' : ' component uses the powerful '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          {isEs ? 'para crear una animación de saludo.' : 'library to create a waving hand animation.'}
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              {isEs ? 'El componente ' : 'The '}
              <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              {isEs ? 'aplica un efecto parallax en la imagen del encabezado.' : 'component provides a parallax effect for the header image.'}
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
