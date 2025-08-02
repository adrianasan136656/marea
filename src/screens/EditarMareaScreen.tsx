import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { Marea } from "../types/marea";
import SoundSelector from "../components/SoundSelector";
import ColorPicker from "react-native-wheel-color-picker";

export default function EditarMareaScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { marea } = route.params;

  const [nombre, setNombre] = useState(marea.nombre);
  const [colorHex, setColorHex] = useState(marea.color);
  const [intensidad, setIntensidad] = useState<number>(marea.intensidad);
  const [descripcion, setDescripcion] = useState(marea.descripcion);
  const [selectedSounds, setSelectedSounds] = useState(marea.sonidos);
  const [soundObjects, setSoundObjects] = useState<Record<string, Audio.Sound>>(
    {}
  );
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollRef = useRef<FlatList>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState !== "active") {
          await pauseAll();
          await stopAndUnloadAll();
        }
      }
    );

    return () => {
      subscription.remove();
      stopAndUnloadAll();
    };
  }, []);

  const stopAndUnloadAll = async () => {
    await Promise.all(
      Object.values(soundObjects).map(async (sound) => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (e) {
          console.warn("Error al liberar sonido:", e);
        }
      })
    );
    setSoundObjects({});
    setVolumes({});
  };

  const toggleSound = async (sound: any) => {
    const isSelected = selectedSounds.some((s: any) => s.id === sound.id);
    let updatedSelection;

    if (isSelected) {
      updatedSelection = selectedSounds.filter((s: any) => s.id !== sound.id);
      if (soundObjects[sound.id]) {
        try {
          await soundObjects[sound.id].stopAsync();
          await soundObjects[sound.id].unloadAsync();
        } catch (e) {
          console.warn("Error al detener sonido:", e);
        }
        const { [sound.id]: _, ...restSounds } = soundObjects;
        setSoundObjects(restSounds);
        const { [sound.id]: __, ...restVolumes } = volumes;
        setVolumes(restVolumes);
      }
    } else {
      if (selectedSounds.length >= 3) return;
      updatedSelection = [...selectedSounds, sound];
      try {
        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: sound.uri,
        });
        await newSound.setIsLoopingAsync(true);
        await newSound.setVolumeAsync(1.0);
        setSoundObjects((prev) => ({ ...prev, [sound.id]: newSound }));
        setVolumes((prev) => ({ ...prev, [sound.id]: 1.0 }));
      } catch (e) {
        console.warn("Error cargando sonido:", e);
      }
    }

    setSelectedSounds(updatedSelection);
  };

  const handleVolumeChange = async (id: string, value: number) => {
    setVolumes((prev) => ({ ...prev, [id]: value }));
    if (soundObjects[id]) {
      try {
        await soundObjects[id].setVolumeAsync(value);
      } catch (e) {
        console.warn("Error cambiando volumen:", e);
      }
    }
  };

  const playAll = async () => {
    try {
      await Promise.all(
        selectedSounds.map(async (s: any) => {
          const sound = soundObjects[s.id];
          if (sound) {
            await sound.setPositionAsync(0);
            await sound.playAsync();
          }
        })
      );
      setIsPlaying(true);
    } catch (e) {
      console.warn("Error reproduciendo mezcla:", e);
    }
  };

  const pauseAll = async () => {
    try {
      await Promise.all(
        Object.values(soundObjects).map(async (sound) => {
          await sound.pauseAsync();
        })
      );
      setIsPlaying(false);
    } catch (e) {
      console.warn("Error pausando mezcla:", e);
    }
  };

  const guardarCambios = async () => {
    try {
      const fechaActual = new Date().toISOString();
      const datos = await AsyncStorage.getItem("mareas");
      const mareas = datos ? JSON.parse(datos) : [];

      const nuevasMareas = mareas.map((item: Marea) =>
        item.fecha === marea.fecha
          ? {
              ...item,
              nombre,
              color: colorHex,
              intensidad,
              descripcion,
              sonidos: selectedSounds,
              fechaActualizacion: fechaActual,
            }
          : item
      );

      await AsyncStorage.setItem("mareas", JSON.stringify(nuevasMareas));

      Alert.alert(
        "¡Cambios guardados!",
        "Tu marea se ha actualizado con éxito.",
        [
          {
            text: "Aceptar",
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "MainTabs",
                      state: {
                        routes: [{ name: "MisMareas" }],
                      },
                    },
                  ],
                })
              );
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    }
  };

  const selectedLabels = selectedSounds.map((s: any) => s.label).join(" + ");

  const formItems = [
    <Text key="titulo" style={styles.label}>
      Nombre:
    </Text>,
    <TextInput
      key="nombre"
      style={styles.input}
      value={nombre}
      onChangeText={setNombre}
      placeholder="Nombre de la marea"
      placeholderTextColor="#1fb28a"
    />,
    <Text key="intensidadLabel" style={styles.label}>
      Intensidad emocional: {intensidad}%
    </Text>,
    <Slider
      key="intensidadSlider"
      style={{ width: "100%" }}
      minimumValue={0}
      maximumValue={100}
      step={1}
      value={intensidad}
      onValueChange={setIntensidad}
      minimumTrackTintColor="#406882"
    />,
    <Text key="sonidosLabel" style={styles.label}>
      Sonidos:
    </Text>,
    <SoundSelector
      key="soundSelector"
      selectedSounds={selectedSounds}
      onToggleSound={toggleSound}
      volumes={volumes}
      onVolumeChange={handleVolumeChange}
    />,
    selectedSounds.length > 0 && (
      <View key="preview" style={styles.previewBox}>
        <Text style={styles.label}>Previsualización sonora:</Text>
        <Text style={styles.previewText}>{selectedLabels}</Text>
      </View>
    ),
    <Text key="descripcionLabel" style={styles.label}>
      Descripción:
    </Text>,
    <TextInput
      key="descripcion"
      style={styles.textArea}
      value={descripcion}
      onChangeText={setDescripcion}
      placeholder="Agrega una descripción opcional"
      placeholderTextColor="#1fb28a"
      multiline
    />,
    <Text key="colorLabel" style={styles.label}>
      Color:
    </Text>,
    <ColorPicker
      key="colorPicker"
      color={colorHex}
      onColorChangeComplete={setColorHex}
      thumbSize={30}
      sliderSize={20}
      noSnap
      row={false}
    />,
    <View key="espacioFinal" style={{ height: 80 }} />,
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            ref={scrollRef}
            data={formItems}
            renderItem={({ item }) => <>{item}</>}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          />
        </TouchableWithoutFeedback>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={isPlaying ? pauseAll : playAll}
            style={[styles.botonRepro, { backgroundColor: colorHex }]}
          >
            <Text style={styles.botonTexto}>
              {isPlaying ? "⏸ Pausar" : "▶️ Reproducir"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={guardarCambios}
          >
            <Text style={styles.botonTexto}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    padding: 20,
    paddingBottom: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#406882",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    minHeight: 80,
    textAlignVertical: "top",
  },
  previewBox: {
    padding: 12,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 14,
    color: "#333",
    marginTop: 10,
  },
  botonGuardar: {
    backgroundColor: "#1fb28a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 10,
    flex: 1,
  },
  botonRepro: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 10,
    flex: 1,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
});
