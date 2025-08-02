import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Marea } from "../types/marea";

const MisMareasScreen = () => {
  const navigation = useNavigation<any>();
  const [mareas, setMareas] = useState<Marea[]>([]);

  useEffect(() => {
    const obtenerMareas = async () => {
      try {
        const stored = await AsyncStorage.getItem("mareas");
        const parsed: Marea[] = stored ? JSON.parse(stored) : [];
        setMareas(parsed);
      } catch (error) {
        console.error("Error cargando mareas:", error);
      }
    };

    const unsubscribe = navigation.addListener("focus", obtenerMareas);
    return unsubscribe;
  }, [navigation]);

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);

    const diasSemana = [
      "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
    ];
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];

    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return {
      diaTexto: `${diaSemana} ${dia} de ${mes} del ${año}`,
      horaTexto: `${horas}:${minutos} horas.`,
    };
  };

  const renderItem = ({ item }: { item: Marea }) => {
    const fecha = item.fecha
      ? formatFecha(item.fecha)
      : null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("DetalleMarea", { marea: item })}
      >
        <View style={[styles.colorPreview, { backgroundColor: item.color }]} />
        <View style={styles.info}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          {fecha && (
            <View style={styles.fechas}>
              <Text style={styles.fecha}>{fecha.diaTexto}</Text>
              <Text style={styles.hora}>{fecha.horaTexto}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Mis Mareas</Text>

        {mareas.length === 0 ? (
          <Text style={styles.vacio}>Aún no has creado ninguna marea.</Text>
        ) : (
          <FlatList
            data={mareas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  titulo: {
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#1fb28a",
  },
  vacio: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  colorPreview: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontWeight: "700",
    fontSize: 18,
    color: "#1A374D",
    marginBottom: 6,
  },
  fechas: {
    marginTop: 2,
  },
  fecha: {
    fontSize: 14,
    color: "#555",
  },
  hora: {
    fontSize: 14,
    color: "#888",
  },
});

export default MisMareasScreen;
