import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { Marea } from "../types/marea";

export default function DetalleMareaScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { marea } = route.params;

  const [soundObjects, setSoundObjects] = useState<Audio.Sound[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const appStateListener = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState !== "active") {
        for (const sound of soundObjects) {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch (e) {
            console.warn("Error al liberar sonido (appState):", e);
          }
        }
        setSoundObjects([]);
        setIsPlaying(false);
      }
    });

    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      for (const sound of soundObjects) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {
          console.warn("Error al liberar sonido (navegación):", e);
        }
      }
      setSoundObjects([]);
      setIsPlaying(false);
    });

    return () => {
      unsubscribe();
      appStateListener.remove();
      soundObjects.forEach((s) => s.unloadAsync());
    };
  }, [soundObjects, navigation]);

  const reproducir = async () => {
    try {
      const nuevosSonidos: Audio.Sound[] = [];
      for (const s of marea.sonidos) {
        const { sound } = await Audio.Sound.createAsync({ uri: s.uri });
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
        nuevosSonidos.push(sound);
      }
      setSoundObjects(nuevosSonidos);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error al reproducir mezcla:", error);
    }
  };

  const pausar = async () => {
    try {
      for (const sound of soundObjects) {
        await sound.pauseAsync();
        await sound.stopAsync();
      }
      setIsPlaying(false);
    } catch (error) {
      console.error("Error al pausar mezcla:", error);
    }
  };

  const handleEliminar = async () => {
    try {
      const existentes = await AsyncStorage.getItem("mareas");
      const parsed: Marea[] = existentes ? JSON.parse(existentes) : [];
      const actualizadas = parsed.filter((item) => item.nombre !== marea.nombre);
      await AsyncStorage.setItem("mareas", JSON.stringify(actualizadas));

      Alert.alert("Eliminada", "Tu marea ha sido eliminada.", [
        {
          text: "OK",
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: "MainTabs",
                    state: {
                      index: 1,
                      routes: [{ name: "CrearMarea" }],
                    },
                  },
                ],
              })
            );
          },
        },
      ]);
    } catch (e) {
      console.error("Error al eliminar la marea:", e);
    }
  };

  const fechaFormateada = marea.fecha
    ? new Date(marea.fecha).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const horaFormateada = marea.fecha
    ? new Date(marea.fecha).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.colorBox, { backgroundColor: marea.color }]}>
            <Text style={styles.tituloDentro}>{marea.nombre}</Text>
          </View>

          {fechaFormateada && (
            <Text style={styles.fecha}>
              Creada el: {fechaFormateada} a las {horaFormateada}.
            </Text>
          )}

          <Text style={styles.seccion}>Intensidad emocional:</Text>
          <Text style={styles.textoSecundario}>{marea.intensidad}%</Text>

          <Text style={styles.seccion}>Sonidos seleccionados:</Text>
          {marea.sonidos.map((s: any) => (
            <Text key={s.id} style={styles.textoSecundario}>• {s.label}</Text>
          ))}

          <Text style={styles.seccion}>Descripción:</Text>
          <Text style={styles.textoSecundario}>
            {marea.descripcion || "(Sin descripción)"}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={isPlaying ? pausar : reproducir}
            style={[styles.botonRepro, { backgroundColor: marea.color }]}
          >
            <Text style={styles.botonTexto}>{isPlaying ? "⏸ Pausar" : "▶️ Reproducir"}</Text>
          </TouchableOpacity>

          <View style={styles.botonera}>
            <TouchableOpacity
              style={[styles.boton, styles.editar]}
              onPress={() => navigation.navigate("EditarMareaScreen", { marea })}
            >
              <Text style={styles.botonTexto}>Modificar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.boton, styles.eliminar]}
              onPress={handleEliminar}
            >
              <Text style={styles.botonTexto}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  volver: {
    color: "#406882",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  tituloDentro: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 20,
  },
  colorBox: {
    height: 90,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  fecha: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 0,
  },
  seccion: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#406882",
    marginTop: 20,
  },
  textoSecundario: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  botonRepro: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  botonera: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  boton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editar: {
    backgroundColor: "#1fb28a",
  },
  eliminar: {
    backgroundColor: "#d9534f",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
