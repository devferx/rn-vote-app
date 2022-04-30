import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {useSocket} from '../hooks/useSocket';

export const HomeScreen = () => {
  const {online, socket} = useSocket('http://localhost:8082');
  const [bands, setBands] = useState([]);
  const [value, setValue] = useState('');
  const [idEditting, setIdEditting] = useState(null);
  const isEditting = idEditting !== null;

  useEffect(() => {
    socket.on('current-bands', data => {
      setBands(data);
    });

    return () => {
      socket.off('current-bands');
    };
  }, [socket]);

  const increseBandVotes = id => {
    socket.emit('vote-band', id);
  };

  const deleteBand = id => {
    socket.emit('delete-band', id);
  };

  const onPressActionButton = () => {
    if (!value.trim().length > 0) return;

    if (isEditting) {
      socket.emit('change-band-name', {id: idEditting, newName: value});
    } else {
      socket.emit('create-band', {name: value});
    }

    setValue('');
    setIdEditting(null);
    Keyboard.dismiss();
  };

  const onPressItem = (id, currentName) => {
    if (isEditting) {
      setIdEditting(null);
      setValue('');
    } else {
      setIdEditting(id);
      setValue(currentName);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BandNames</Text>
      <Text style={styles.text}>
        Status:{' '}
        {online ? (
          <Text style={styles.onlineText}>Online</Text>
        ) : (
          <Text style={styles.offlineText}>Offline</Text>
        )}
      </Text>

      <View style={styles.formView}>
        <TextInput
          style={styles.formControl}
          placeholder="New Band"
          value={value}
          onChangeText={v => setValue(v)}
        />
        <TouchableOpacity
          style={[styles.itemButton, isEditting && styles.editButton]}
          onPress={() => onPressActionButton()}>
          <Text style={styles.itemButtonText}>
            <Icon name="create" color="white" size={18} />
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bands}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => onPressItem(item.id, item.name)}>
            <View style={styles.itemContainer}>
              <Text style={styles.text}>
                {item.votes} {'-'} {item.name}
              </Text>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.itemButton}
                  activeOpacity={0.8}
                  onPress={() => increseBandVotes(item.id)}>
                  <Text style={styles.itemButtonText}>
                    <Icon name="add" color="white" size={18} />
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.itemButton, styles.deleteButton]}
                  activeOpacity={0.8}
                  onPress={() => deleteBand(item.id)}>
                  <Icon name="trash" color="white" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  onlineText: {
    color: '#00ff00',
  },
  offlineText: {
    color: 'red',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#282c34',
    flex: 1,
  },
  formView: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  formControl: {
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    paddingHorizontal: 10,
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
  },
  empty: {},
  itemButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#06bcee',
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  deleteButton: {
    backgroundColor: '#fa383e',
  },
  editButton: {
    backgroundColor: '#ffd700',
  },
  text: {
    color: '#fff',
  },
  itemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
