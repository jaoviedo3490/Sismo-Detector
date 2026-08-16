import * as Device from 'expo-device';
import { Platform, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import AccelerometerService from '../SismoApp/Services/AccelerometerService.js';
import { AccelerometerGraph } from '@/components/AccelerometerGraph';
import AccelerationMagnitudeService from '../SismoApp/Services/AccelerationMagnitudeService.js';

type AccelerometerData = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
};

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const [sismoData, setSismoData] = useState<AccelerometerData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const serviceRef = useRef<AccelerometerService | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAccelerometer = async () => {
      try {
        // Obtener instancia del servicio
        const instance = AccelerometerService.getInstance();
        serviceRef.current = instance;
        
        // Iniciar el acelerómetro
        await instance.start();
        const instanceOfAccelMagnitudeS = AccelerationMagnitudeService.getInstance();
        setIsRecording(true);
        
        console.log('Acelerómetro iniciado correctamente');

        // Configurar intervalo para actualizar los datos
        intervalRef.current = setInterval(() => {
          if (isMounted && serviceRef.current) {
            // Obtener datos actuales
            const newData = serviceRef.current.getDatosActuales();
            instanceOfAccelMagnitudeS.DataCollector(newData);
            instanceOfAccelMagnitudeS.ProcessFunctions();
            //console.log(newData);
            if (newData && newData.length > 0) {
              // Actualizar el estado con los nuevos datos
              setSismoData(prevData => {
                // Combinar datos existentes con nuevos (opcional)
                // return [...prevData, ...newData];
                
                // O reemplazar completamente (como lo tenías)
                return newData;
              });
            }
          }
          //intervalRef.cleanData();
        }, 100); // Actualizar cada 100ms para mejor rendimiento
        
      } catch (error: any) {
        console.error('Error al inicializar el acelerómetro:', error);
        Alert.alert(
          'Error',
          `Ocurrió un error en la ejecución del servicio del acelerómetro: ${error.message}`
        );
      }
    };

    initializeAccelerometer();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Limpiar intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Detener el acelerómetro
      if (serviceRef.current) {
        try {
          serviceRef.current.stopAccelerometer();
          serviceRef.current.cleanData();
          console.log('Acelerómetro detenido correctamente');
        } catch (error) {
          console.error('Error al detener el acelerómetro:', error);
        }
      }
      
      setIsRecording(false);
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Sismo-metro
          </ThemedText>
          <ThemedText type="small" style={styles.recordingStatus}>
            {isRecording ? '🟢 Grabando...' : '🔴 Detenido'}
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          Datos: {sismoData.length} muestras
          {sismoData.length > 0 && ` | Último: x=${sismoData[sismoData.length-1]?.x.toFixed(2)}`}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>
        
        <ThemedView type="backgroundElement" style={styles.graphContainer}>
          <AccelerometerGraph sismoData={sismoData} />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
    fontSize: 12,
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  graphContainer: {
    flex: 2,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
    minHeight: 200,
  },
  recordingStatus: {
    marginTop: Spacing.two,
    fontWeight: 'bold',
  },
});