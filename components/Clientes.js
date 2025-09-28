 import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { globalStyles } from "../Styles/globalStyles";

function TelaAgenda({ navigation, clientes = [], setClientes = () => {} }) {
  const [busca, setBusca] = useState('');

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.pet.toLowerCase().includes(busca.toLowerCase())
  );

  const renderizarItem = ({ item }) => (
    <TouchableOpacity
      style={globalStyles.listItem}
      onPress={() =>
        navigation.navigate('TelaCadastroCliente', {
          setClientes,
          cliente: item,
        })
      }
    >
      <Text style={globalStyles.listText}>
        <Text style={{ fontWeight: 'bold' }}>{item.nome}</Text> | Pet:{' '}
        <Text style={{ color: '#555' }}>{item.pet}</Text>
      </Text>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AgendamentoCalendario', {
            clienteSelecionado: item,
          })
        }
      >
        <Text style={globalStyles.link}>Agendar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.listItem}>
        <TextInput
          style={globalStyles.input}
          placeholder="Pesquise o cliente"
          value={busca}
          onChangeText={setBusca}
        />
        <AntDesign name="search1" size={20} color="#ccc" />
      </View>

      <FlatList
        data={clientesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderizarItem}
        ListEmptyComponent={() => (
          <Text style={globalStyles.emptyText}>Nenhum cliente encontrado.</Text>
        )}
      />

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() =>
          navigation.navigate('TelaCadastroCliente', { setClientes })
        }
      >
        <Text style={globalStyles.buttonText}>Adicionar</Text>
      </TouchableOpacity>
    </View>
  );
}

function TelaCadastroCliente({ navigation, route, setClientes }) {
  const cliente = route.params?.cliente;
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [nomePet, setNomePet] = useState('');
  const [id, setId] = useState(null);

  useEffect(() => {
    if (cliente) {
      setId(cliente.id);
      setNomeCliente(cliente.nome);
      setTelefone(cliente.telefone);
      setEndereco(cliente.endereco);
      setNomePet(cliente.pet);
    }
  }, [cliente]);

  const lidarComSalvar = () => {
    if (!nomeCliente || !telefone || !endereco || !nomePet) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const dadosCliente = {
      id: id || Date.now().toString(),
      nome: nomeCliente,
      telefone,
      endereco,
      pet: nomePet,
    };

    if (id) {
      setClientes((clientesAtuais) =>
        clientesAtuais.map((c) => (c.id === id ? dadosCliente : c))
      );
      Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
    } else {
      setClientes((clientesAtuais) => [...clientesAtuais, dadosCliente]);
      Alert.alert('Sucesso', 'Cliente salvo com sucesso!');
    }

    navigation.goBack();
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Novo Cliente</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Nome do cliente"
        value={nomeCliente}
        onChangeText={setNomeCliente}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={setTelefone}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Endereço"
        value={endereco}
        onChangeText={setEndereco}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Nome do Pet"
        value={nomePet}
        onChangeText={setNomePet}
      />

      <TouchableOpacity style={globalStyles.button} onPress={lidarComSalvar}>
        <Text style={globalStyles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

export { TelaAgenda, TelaCadastroCliente };
