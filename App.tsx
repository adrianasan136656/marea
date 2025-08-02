import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import LaunchScreen from "./src/screens/LaunchScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CrearMareaScreen from "./src/screens/CrearMareaScreen";
import MisMareasScreen from "./src/screens/MisMareasScreen";
import AcercaDeScreen from "./src/screens/AcercaDeScreen";
import DetalleMareaScreen from "./src/screens/DetalleMareaScreen";
import EditarMareaScreen from "./src/screens/EditarMareaScreen";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === "CrearMareaScreen") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "MisMareasScreen") {
            iconName = focused ? "list-circle" : "list-circle-outline";
          } else if (route.name === "AcercaDeScreen") {
            iconName = focused ? "information-circle" : "information-circle-outline";
          } else {
            iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1fb28a",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="CrearMareaScreen"
        component={CrearMareaScreen}
        options={{ title: "Crear" }}
      />
      <Tab.Screen
        name="MisMareasScreen"
        component={MisMareasScreen}
        options={{ title: "Mis Mareas" }}
      />
      <Tab.Screen
        name="AcercaDeScreen"
        component={AcercaDeScreen}
        options={{ title: "Acerca de" }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LaunchScreen" component={LaunchScreen} />
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="MisMareas" component={MisMareasScreen} />
        <Stack.Screen name="DetalleMarea" component={DetalleMareaScreen} />
        <Stack.Screen name="EditarMareaScreen" component={EditarMareaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
