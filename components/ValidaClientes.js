import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { globalStyles } from "../Styles/globalStyles";

function ValidaClientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [service, setService] = useState("");

  useEffect(() => {
    carregarClientes();
    carregarAgendamentos();
  }, []);

  const carregarClientes = async () => {
    try {
      const dados = await AsyncStorage.getItem("@Clientes");
      const lista = dados ? JSON.parse(dados) : [];
      setClientes(lista);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const dados = await AsyncStorage.getItem("usuarios");
      const lista = dados ? JSON.parse(dados) : [];
      setAgendamentos(lista);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  };

  const salvarAgendamento = async () => {
    if (!clienteSelecionado) {
      Alert.alert("Atenção", "Selecione um cliente primeiro.");
      return;
    }
    if (!service) {
      Alert.alert("Atenção", "Selecione um serviço.");
      return;
    }

    try {
      const novoAgendamento = {
        id: Date.now(),
        cliente: clienteSelecionado.nome,
        pet: clienteSelecionado.pet,
        dia: date.toISOString().split("T")[0],
        hora: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        servico: service,
      };

      const dados = await AsyncStorage.getItem("usuarios");
      const lista = dados ? JSON.parse(dados) : [];
      lista.push(novoAgendamento);

      await AsyncStorage.setItem("usuarios", JSON.stringify(lista));

      Alert.alert("Sucesso", "Agendamento salvo!");
      setService("");
      carregarAgendamentos();
    } catch (error) {
      console.error(error);
    }
  };

  const agendamentosCliente = clienteSelecionado
    ? agendamentos.filter((ag) => ag.cliente === clienteSelecionado.nome)
    : [];

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Central de Clientes</Text>

      <Picker
        selectedValue={clienteSelecionado ? clienteSelecionado.id : null}
        onValueChange={(valor) =>
          setClienteSelecionado(clientes.find((c) => c.id === valor))
        }
        style={globalStyles.input}
      >
        <Picker.Item label="Selecione um cliente..." value={null} />
        {clientes.map((c) => (
          <Picker.Item
            key={c.id}
            label={`${c.nome} | Pet: ${c.pet}`}
            value={c.id}
          />
        ))}
      </Picker>

      {clienteSelecionado && (
        <>
          <Text style={globalStyles.cardTitle}>
            Agendamentos de {clienteSelecionado.nome}
          </Text>
          <FlatList
            data={agendamentosCliente}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={globalStyles.listItem}>
                <Text style={globalStyles.listText}>
                  Pet: {item.pet} | Serviço: {item.servico} | Data: {item.dia} | Hora: {item.hora}
                </Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={globalStyles.emptyText}>
                Nenhum agendamento para este cliente.
              </Text>
            )}
          />
        </>
      )}

      {clienteSelecionado && (
        <View style={{ marginTop: 20 }}>
          <Text style={globalStyles.cardTitle}>Novo Agendamento</Text>

          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => setShowDate(true)}
          >
            <Text style={globalStyles.buttonText}>Selecionar Data</Text>
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, selectedDate) => {
                setShowDate(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity
            style={globalStyles.button}
            onPress={() => setShowTime(true)}
          >
            <Text style={globalStyles.buttonText}>Selecionar Hora</Text>
          </TouchableOpacity>
          {showTime && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={(e, selectedDate) => {
                setShowTime(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity
            style={globalStyles.button}
            onPress={() =>
              navigation.navigate("AgendamentoCalendario", {
                clienteSelecionado,
              })
            }
          >
            <Text style={globalStyles.buttonText}>Salvar Agendamento</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function AgendamentoCalendario({ navigation, route }) {
  const [dataSelecionada, setDataSelecionada] = useState("");
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const { clienteSelecionado } = route.params || {};

  const handleAgendar = () => {
    if (!dataSelecionada) {
      alert("Selecione uma data para continuar!");
      return;
    }
    const [ano, mes, dia] = dataSelecionada.split("-").map(Number);
    const dataEscolhida = new Date(ano, mes - 1, dia);

    if (dataEscolhida < hoje) {
      alert("Escolha uma data igual ou posterior a hoje!");
      return;
    }

    navigation.navigate("AgendamentoHora", {
      clienteSelecionado,
      dataSelecionada,
    });
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Agendamento</Text>

      <Calendar
        onDayPress={(day) => setDataSelecionada(day.dateString)}
        markedDates={{
          [dataSelecionada]: { selected: true, selectedColor: "#cc0000" },
        }}
        theme={{
          selectedDayBackgroundColor: "#cc0000",
          todayTextColor: "#cc0000",
          arrowColor: "#cc0000",
          textDayFontWeight: "500",
          textMonthFontWeight: "bold",
        }}
        style={globalStyles.calendar}
      />

      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: "#cc0000" }]}
        onPress={handleAgendar}
      >
        <Text style={globalStyles.buttonText}>Próximo</Text>
      </TouchableOpacity>
    </View>
  );
}

function AgendamentoHora({ navigation, route }) {
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [service, setService] = useState("");

  const { clienteSelecionado, dataSelecionada } = route.params || {};

  const horarios = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
  ];

  const handleAgendar = () => {
    if (!service) {
      alert("Selecione um serviço!");
      return;
    }
    if (!horaSelecionada) {
      alert("Selecione um horário para continuar!");
      return;
    }

    setModalVisible(true);
  };

  const confirmarAgendamento = async () => {
    try {
      const dados = await AsyncStorage.getItem("usuarios");
      const lista = dados ? JSON.parse(dados) : [];

      const novoAgendamento = {
        id: Date.now(),
        cliente: clienteSelecionado.nome,
        pet: clienteSelecionado.pet,
        dia: dataSelecionada,
        hora: horaSelecionada,
        servico: service,
      };

      lista.push(novoAgendamento);
      await AsyncStorage.setItem("usuarios", JSON.stringify(lista));

      setModalVisible(false);

      navigation.reset({
        id: 0,
        routes: [{ name: "HomeDrawer" }],
      });
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      Alert.alert("Erro", "Não foi possível salvar o agendamento.");
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Escolha um horário</Text>

      <FlatList
        data={horarios}
        keyExtractor={(item) => item}
        numColumns={4}
        contentContainerStyle={{ ...globalStyles.container, alignItems: 'center' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              globalStyles.botaoHorario,
              horaSelecionada === item && globalStyles.botaoSelecionado,
            ]}
            onPress={() => setHoraSelecionada(item)}
          >
            <Text
              style={[
                globalStyles.textoHeD,
                horaSelecionada === item && globalStyles.botaoSelecionado,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={globalStyles.cardTitle}>Serviço:</Text>
      <Picker
        selectedValue={service}
        onValueChange={(valor) => setService(valor)}
        style={globalStyles.input}
      >
        <Picker.Item label="Selecione um serviço..." value="" />
        <Picker.Item label="Banho" value="Banho" />
        <Picker.Item label="Tosa" value="Tosa" />
        <Picker.Item label="Cortar unha" value= "Cortar unha" />
      </Picker>

      <TouchableOpacity style={globalStyles.button} onPress={handleAgendar}>
        <Text style={globalStyles.buttonText}>Confirmar</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <Text style={globalStyles.modalTitle}>Confirmar Agendamento</Text>
            <Text style={globalStyles.modalText}>
              Cliente: {clienteSelecionado.nome}
            </Text>
            <Text style={globalStyles.modalText}>
              Pet: {clienteSelecionado.pet}
            </Text>
            <Text style={globalStyles.modalText}>Serviço: {service}</Text>
            <Text style={globalStyles.modalText}>
              Data: {dataSelecionada}
            </Text>
            <Text style={globalStyles.modalText}>Horário: {horaSelecionada}</Text>
            <View style={globalStyles.modalButtonRow}>
              <TouchableOpacity
                style={[globalStyles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={globalStyles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.modalButton, { backgroundColor: "#cc0000" }]}
                onPress={confirmarAgendamento}
              >
                <Text style={globalStyles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AgendamentosConfirmados({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);

  const carregarAgendamentos = async () => {
    try {
      const dados = await AsyncStorage.getItem("usuarios");
      const lista = dados ? JSON.parse(dados) : [];
      setAgendamentos(lista);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      Alert.alert("Erro", "Não foi possível carregar os agendamentos.");
    }
  };

  const excluirAgendamento = async (id) => {
    try {
      const novaLista = agendamentos.filter((agendamento) => agendamento.id !== id);
      setAgendamentos(novaLista);
      await AsyncStorage.setItem("usuarios", JSON.stringify(novaLista));
      Alert.alert("Sucesso", "Agendamento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      Alert.alert("Erro", "Não foi possível excluir o agendamento.");
    }
  };

  useEffect(() => {
    carregarAgendamentos();
    const unsubscribe = navigation.addListener("focus", () => {
      carregarAgendamentos();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Agendamentos Confirmados</Text>

      <FlatList
        data={agendamentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>
              Cliente: {item.cliente}
            </Text>
            <Text style={globalStyles.cardTitle}>
              Pet: {item.pet}
            </Text>
            <Text style={globalStyles.cardTitle}>Serviço: {item.servico}</Text>
            <Text style={globalStyles.cardTitle}>
              Data: {item.dia}
            </Text>
            <Text style={globalStyles.cardTitle}>Horário: {item.hora}</Text>
            <TouchableOpacity
              style={globalStyles.botaoExcluir}
              onPress={() =>
                Alert.alert(
                  "Excluir",
                  "Deseja excluir esse agendamento?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Excluir", onPress: () => excluirAgendamento(item.id) },
                  ]
                )
              }
            >
              <Text style={globalStyles.textoSelecionado}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={globalStyles.emptyText}>
            Nenhum agendamento encontrado.
          </Text>
        )}
      />
    </View>
  );
}

export { ValidaClientes, AgendamentoCalendario, AgendamentoHora, AgendamentosConfirmados };