import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { globalStyles } from "../Styles/globalStyles";


export default function MenuPrincipal({ navigation }) {
  const [clientes, setClientes] = useState([]);

  const validaCliente = async () => {
    try {
      const dados = await AsyncStorage.getItem("usuarios");
      const lista = dados ? JSON.parse(dados) : [];

      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");
      const dataHoje = `${ano}-${mes}-${dia}`; 

      const agendamentosHoje = lista
        .filter((cliente) => cliente.dia === dataHoje)
        .map((cliente, idx) => ({
          ...cliente,
          id: `${idx}`,
          completed: false,
        }));

      setClientes(agendamentosHoje);
    } catch (error) {
      alert("Erro ao carregar agendamentos");
      console.error(error);
    }
  };

  const toggleComplete = (id) => {
    const updateAgendamento = clientes.map((cliente) =>
      cliente.id === id ? { ...cliente, completed: !cliente.completed } : cliente
    );
    setClientes(updateAgendamento);
  };

  const deleteSessao = (id) => {
    const confirmarExclusao = async () => {
      const clienteParaExcluir = clientes.find((c) => c.id === id);
      if (!clienteParaExcluir) return;

      const filteredClientes = clientes.filter((cliente) => cliente.id !== id);
      setClientes(filteredClientes);

      try {
        const dados = await AsyncStorage.getItem("usuarios");
        const lista = dados ? JSON.parse(dados) : [];
        const novaLista = lista.filter(
          (cliente) =>
            !(
              cliente.nome === clienteParaExcluir.nome &&
              cliente.animal === clienteParaExcluir.animal &&
              cliente.servico === clienteParaExcluir.servico &&
              cliente.dia === clienteParaExcluir.dia &&
              cliente.horario === clienteParaExcluir.horario
            )
        );
        await AsyncStorage.setItem("usuarios", JSON.stringify(novaLista));
      } catch (error) {
        console.error("Erro ao atualizar armazenamento:", error);
      }
    };

    if (Platform.OS === "web") {
      const confirmDelete = window.confirm(
        "Tem certeza que deseja excluir o agendamento?"
      );
      if (confirmDelete) confirmarExclusao();
    } else {
      Alert.alert(
        "Confirmar Exclusão",
        "Tem certeza de que deseja excluir este agendamento?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", onPress: confirmarExclusao, style: "destructive" },
        ],
        { cancelable: true }
      );
    }
  };

  useEffect(() => {
    validaCliente();
  }, []);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Agendamentos de hoje</Text>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <Text style={globalStyles.listText}>
              {`Cliente: ${item.cliente}\nAnimal: ${item.pet}\nServiço: ${item.servico}\nHorário: ${item.dia}`}
            </Text>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
              <AntDesign
                name={item.completed ? "checkcircle" : "checkcircleo"}
                size={24}
                color={item.completed ? "green" : "#ccc"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteSessao(item.id)}>
              <AntDesign name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={globalStyles.emptyText}>
            Nenhuma agenda cadastrada para hoje
          </Text>
        )}
      />
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate("Clientes")}
      >
        <Text style={globalStyles.buttonText}>Agendar</Text>
      </TouchableOpacity>
    </View>
  );
}

