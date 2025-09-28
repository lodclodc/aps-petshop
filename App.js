import React, { useState, useEffect } from "react"; 
import { View, Text, Image, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { globalStyles, colors } from "./globalStyles";

import {  
  AgendamentosConfirmados, 
  AgendamentoCalendario,
  AgendamentoDados,
  AgendamentoHora,
  ValidaClientes
} from "./components/ValidaClientes";

import {
  TelaAgenda,
  TelaCadastroCliente
} from "./components/Clientes";

import MenuPrincipal from "./components/MenuPrincipal";

const LOGO = { uri: "https://2025renato.github.io/agenda-pet-assets/logo-png.png" };

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={globalStyles.homeWrap}>
      <View style={globalStyles.redTop} />
      <View style={globalStyles.redBottom} />
      <View style={globalStyles.homeContent}>
        <Text style={globalStyles.pixelTitle}>AGENDA PET</Text>
        <Image source={LOGO} style={globalStyles.logo} />
        <TouchableOpacity
          style={globalStyles.btnPrimary}
          onPress={() => navigation.replace("HomeDrawer")}
        >
          <Text style={globalStyles.btnPrimaryText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DrawerNavigatorScreens({ clientes, setClientes }) {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.redTop },
        headerTintColor: colors.white,
        drawerActiveTintColor: colors.redTop,
      }}
    >
      <Drawer.Screen
        name="Menu"
        component={MenuPrincipal}
        options={{
          drawerLabel: "Início",
          drawerIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Clientes"
        options={{
          drawerLabel: "Clientes",
          drawerIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <TelaAgenda {...props} clientes={clientes} setClientes={setClientes} />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="Agendamentos"
        component={AgendamentosConfirmados}
        options={{
          drawerLabel: "Agendamentos",
          drawerIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
}

export default function App() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("@Clientes");
        const parsed = jsonValue != null ? JSON.parse(jsonValue) : [];
        setClientes(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.log("Erro ao carregar clientes:", e);
      }
    };
    carregarClientes();
  }, []);

  useEffect(() => {
    const salvarClientes = async () => {
      try {
        const jsonValue = JSON.stringify(clientes);
        await AsyncStorage.setItem("@Clientes", jsonValue);
      } catch (e) {
        console.log("Erro ao salvar clientes:", e);
      }
    };
    salvarClientes();
  }, [clientes]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.redMain },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeDrawer"
          options={{ headerShown: false }}
        >
          {(props) => (
            <DrawerNavigatorScreens
              {...props}
              clientes={clientes}
              setClientes={setClientes}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="TelaCadastroCliente"
          options={{ title: "Novo Cliente" }}
        >
          {(props) => <TelaCadastroCliente {...props} setClientes={setClientes} />}
        </Stack.Screen>
        
        <Stack.Screen name="AgendamentoDados" 
        options={{ title: "Novo Cliente" }}
        component={AgendamentoDados} 
        />

        <Stack.Screen name="AgendamentoCalendario" 
        options={{ title: "Calendário" }} 
        component={AgendamentoCalendario} 
        />

        <Stack.Screen name="AgendamentoHora" 
        options={{ title: "Horário e Serviço" }} 
        component={AgendamentoHora} 
        />
        <Stack.Screen
          name="ValidaClientes"
          component={ValidaClientes}
          options={{ title: "Central de Clientes" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
