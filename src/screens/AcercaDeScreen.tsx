import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function AcercaDeScreen() {
  return (
    <LinearGradient colors={["#fdfcfb", "#e2ebf0"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Acerca de Marea</Text>

          <Text style={styles.paragraph}>
            Marea es una aplicación creada para registrar y representar cómo te
            sientes mediante elementos sensoriales. No se trata solo de
            escribir, sino de construir una imagen emocional a través del color,
            el sonido y las emociones fluyan.
          </Text>

          <Text style={styles.paragraph}>
            Cada marea es una pequeña composición emocional. Puedes nombrarla,
            elegir un color que la represente, mezclar sonidos ambientales y
            ajustar su intensidad para darle imagen a tu sentir.
          </Text>

          <Text style={styles.tagline}>
            Porque cada emoción merece su espacio y su ritmo.
          </Text>

          <Text style={styles.paragraph}>
            Marea es una app forma parte de una línea de productos digitales de
            Adriana Santiago; que de la mano con “Marea consiente”, (un podcast
            que ofrece recomendaciones de vida sustentable, así como audios y
            sonidos provenientes del mar para dormir y meditar) son proyectos
            que comparten la misma esencia, una conexión emocional con lo que
            nos rodea y el deseo de cuidar, tanto por dentro como por fuera.
          </Text>

          <View style={styles.footerContainer}>
            <Text style={styles.signature}>Adriana Santiago · 2025</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContainer: {
    padding: 24,
  },
  logo: {
    width: 500,
    height: 100,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    textAlign: "center",
    color: "#1fb28a",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    textAlign: "center",
    color: "#406882",
    marginTop: 20,
    lineHeight: 24,
  },
  tagline: {
    fontSize: 14,
    color: "#1fb28a",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 28,
  },
  footerContainer: {
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  agradecimiento: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#999",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  signature: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});
