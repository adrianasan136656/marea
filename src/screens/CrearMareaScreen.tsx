import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  AppState,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import SoundSelector from "../components/SoundSelector";
import ColorPicker from "react-native-wheel-color-picker";
import { useFocusEffect } from "@react-navigation/native";

export type Sound = {
  id: string;
  label: string;
  uri: string;
};

export default function CrearMareaScreen() {
  const [nombre, setNombre] = useState("");
  const [colorHex, setColorHex] = useState("#007BFF");
  const [intensidad, setIntensidad] = useState<number>(50);
  const [descripcion, setDescripcion] = useState("");
  const [selectedSounds, setSelectedSounds] = useState<Sound[]>([]);
  const [soundObjects, setSoundObjects] = useState<Record<string, Audio.Sound>>(
    {}
  );
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const playingRef = useRef(false);
  const descripcionInputRef = useRef<TextInput>(null);
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

  useFocusEffect(
    useCallback(() => {
      resetFormulario();

      return () => {
        stopAndUnloadAll();
      };
    }, [])
  );

  const resetFormulario = async () => {
    setNombre("");
    setColorHex("#007BFF");
    setIntensidad(50);
    setDescripcion("");
    setSelectedSounds([]);
    setIsPlaying(false);
    await stopAndUnloadAll();
  };

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

  const toggleSound = async (sound: Sound) => {
    const isSelected = selectedSounds.some((s) => s.id === sound.id);
    let updatedSelection: Sound[] = [];

    if (isSelected) {
      updatedSelection = selectedSounds.filter((s) => s.id !== sound.id);
      if (soundObjects[sound.id]) {
        try {
          await soundObjects[sound.id].stopAsync();
          await soundObjects[sound.id].unloadAsync();
        } catch (e) {
          console.warn("Error al detener/descargar sonido:", e);
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
        selectedSounds.map(async (s) => {
          const sound = soundObjects[s.id];
          if (sound) {
            await sound.setPositionAsync(0);
            await sound.playAsync();
          }
        })
      );
      setIsPlaying(true);
      playingRef.current = true;
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
      playingRef.current = false;
    } catch (e) {
      console.warn("Error pausando mezcla:", e);
    }
  };

  const handleGuardarMarea = async () => {
    if (!nombre.trim()) {
      Alert.alert("Falta nombre", "Por favor ingresa un nombre para tu marea.");
      return;
    }
    if (selectedSounds.length === 0) {
      Alert.alert(
        "Sin sonidos",
        "Selecciona al menos un sonido para guardar la marea."
      );
      return;
    }

    const nuevaMarea = {
      nombre,
      color: colorHex,
      intensidad,
      descripcion,
      sonidos: selectedSounds,
      fecha: new Date().toISOString(),
    };

    try {
      const existentes = await AsyncStorage.getItem("mareas");
      const parsed = existentes ? JSON.parse(existentes) : [];
      const actualizadas = [...parsed, nuevaMarea];
      await AsyncStorage.setItem("mareas", JSON.stringify(actualizadas));

      Alert.alert("¡Marea guardada!", "Tu marea se ha registrado con éxito.");
      resetFormulario(); // 🧼 Limpiar después de guardar
    } catch (error) {
      console.warn("Error guardando marea en AsyncStorage:", error);
      Alert.alert("Error", "No se pudo guardar la marea.");
    }
  };

  const selectedLabels = selectedSounds.map((s) => s.label).join(" + ");

  const formItems = [
    <Text key="heading" style={styles.heading}>
      ¿Cómo está tu marea hoy?
    </Text>,
    <View key="nombre">
      <Text style={styles.label}>Nombre de tu marea:</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej. Marea tranquila"
        placeholderTextColor="#1fb28a"
      />
    </View>,
    <View key="intensidad">
      <Text style={styles.label}>Intensidad emocional: {intensidad}%</Text>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={intensidad}
        onValueChange={setIntensidad}
        minimumTrackTintColor="#1fb28a"
        maximumTrackTintColor="#ccc"
      />
    </View>,
    <View key="sonidos">
      <Text style={styles.label}>Sonidos:</Text>
      <SoundSelector
        selectedSounds={selectedSounds}
        onToggleSound={toggleSound}
        volumes={volumes}
        onVolumeChange={handleVolumeChange}
      />
    </View>,
    selectedSounds.length > 0 && (
      <View key="preview" style={styles.previewBox}>
        <Text style={styles.label}>Previsualización sonora:</Text>
        <Text style={styles.previewText}>{selectedLabels}</Text>
        <TouchableOpacity
          onPress={isPlaying ? pauseAll : playAll}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>
            {isPlaying ? "⏸ Pausar mezcla" : "▶️ Reproducir mezcla"}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    <View key="descripcion">
      <Text style={styles.label}>Descripción:</Text>
      <TextInput
        ref={descripcionInputRef}
        style={[styles.input, styles.descripcionInput]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Describe tu marea poéticamente..."
        placeholderTextColor="#1fb28a"
        multiline
        textAlignVertical="top"
      />
    </View>,
    <View key="color">
      <Text style={styles.label}>Color de tu marea:</Text>
      <View style={styles.colorPickerContainer}>
        <ColorPicker
          color={colorHex}
          onColorChangeComplete={setColorHex}
          thumbSize={30}
          sliderSize={20}
          noSnap
          row={false}
        />
      </View>
      <View style={[styles.colorPreview, { backgroundColor: colorHex }]} />
    </View>,
    <TouchableOpacity
      key="guardar"
      style={styles.saveButton}
      onPress={handleGuardarMarea}
    >
      <Text style={styles.saveButtonText}> Guardar Marea</Text>
    </TouchableOpacity>,
    <View key="footer-space" style={{ height: 8 }} />,
  ].filter(Boolean);

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            ref={scrollRef}
            data={formItems}
            renderItem={({ item }) => <>{item}</>}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={<View style={{ height: 0 }} />}
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 0,
  },
  heading: {
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#1fb28a",
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
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  descripcionInput: {
    minHeight: 120,
  },
  colorPickerContainer: {
    height: 260,
    marginBottom: 16,
  },
  colorPreview: {
    width: "100%",
    height: 40,
    borderRadius: 8,
    marginBottom: 24,
  },
  previewBox: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  previewText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#1fb28a",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
