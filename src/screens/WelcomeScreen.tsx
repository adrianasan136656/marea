import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "WelcomeScreen"
>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleStart = () => {
    navigation.replace("MainTabs");
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo-marea.png")} style={styles.logo} />
      <Text style={styles.title}>¡Bienvenidx a Marea!</Text>
      <Text style={styles.paragraph}> Marea es una app para registrar cómo te sientes, no solo con palabras, sino también con sonidos, colores y un nombre que capture el instante. </Text>
      <Text style={styles.paragraph}>Aquí, cada marea que creas es una forma de habitar tus emociones: suave o intensa, clara o confusa, pero siempre auténtica.</Text>
      <Text style={styles.paragraph}>Este es tu espacio íntimo sensorial para transformar lo que sientes en algo que puedes ver, oír y recordar.</Text>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>¡Comenzar a crear!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    resizeMode: "contain",
    borderRadius: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#1fb28a",
  },
  paragraph: {
    fontSize: 16,
    color: "#406882",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#1fb28a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
