import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { cardAPI, listAPI } from '../services/api';

export default function CreateTaskScreen({ route, navigation }: any) {
  const { preSelectedList, preSelectedListId, board } = route.params || {};
  const { 
    currentBoard, 
    lists, 
    cards, 
    addCard, 
    addList, 
    user,
    addNotification 
  } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableLists, setAvailableLists] = useState<any[]>([]);

  const usedBoard = board || currentBoard;

  
  const DEFAULT_LISTS = [
    { name: 'Pending', type: 'pending', color: '#ef4444' },
    { name: 'In Progress', type: 'inprogress', color: '#f59e0b' },
    { name: 'Done', type: 'done', color: '#10b981' }
  ];

  // ObjectId válido de 24 caracteres
  const generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
   
    const randomBytes = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    

    const objectId = timestamp + randomBytes;
    
    console.log('Generated ObjectId:', objectId, 'Length:', objectId.length);
    return objectId;
  };

  const createDefaultLists = async (boardId: string) => {
    const createdLists = [];

    for (let i = 0; i < DEFAULT_LISTS.length; i++) {
      const listData = DEFAULT_LISTS[i];
      try {
        console.log(`Creating list: ${listData.name} for board: ${boardId}`);
        
        const response = await listAPI.create({
          boardId: boardId,
          name: listData.name
        });
        
        const newList = {
          ...response.data,
          type: listData.type,
          color: listData.color
        };
        
        createdLists.push(newList);
        addList(newList);
        
      } catch (error) {
        console.error(`Error creating ${listData.name} list:`, error);
        
       
        const objectId = generateObjectId();
        console.log(`Creating local list with ID: ${objectId}, length: ${objectId.length}`);
        
        const localList = {
          _id: objectId,
          name: listData.name,
          boardId: boardId,
          board: boardId,
          order: i,
          type: listData.type,
          color: listData.color,
          createdAt: new Date().toISOString()
        };
        
        createdLists.push(localList);
        addList(localList);
      }
    }

    return createdLists;
  };


  const getStatusNameInSpanish = (listType: string) => {
    switch (listType) {
      case 'pending':
        return 'Pendiente';
      case 'inprogress':
        return 'En Progreso';
      case 'done':
        return 'Completada';
      default:
        return listType;
    }
  };


  const createTaskNotification = (taskTitle: string, listName: string, listType: string, taskId?: string) => {
    const statusName = getStatusNameInSpanish(listType);
    const userName = user?.name || user?.username || user?.email || 'Usuario';
    const boardName = usedBoard?.name || 'Tablero';
    
    console.log('=== CREANDO NOTIFICACIÓN ===');
    console.log('Título de tarea:', taskTitle);
    console.log('Estado:', statusName);
    console.log('Usuario:', userName);
    console.log('Tablero:', boardName);
    
    const notification = {
      _id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'task_created',
      message: `${userName} creó la tarea "${taskTitle}" en estado "${statusName}" en el tablero "${boardName}"`,
      taskId: taskId || `temp-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      user: userName,
      status: statusName,
      boardName: boardName,
      taskTitle: taskTitle
    };

    console.log('Notificación creada:', notification);
    
    try {
      addNotification(notification);
      console.log('✅ Notificación agregada exitosamente');
    } catch (error) {
      console.error('Error agregando notificación:', error);
    }
  };

  useEffect(() => {
    const setupLists = async () => {
      if (!usedBoard) return;

      console.log('Setting up lists for board:', usedBoard._id);
      console.log('All available lists:', lists);
      
     
      let boardLists = lists.filter(list => 
        list.boardId === usedBoard._id || list.board === usedBoard._id
      );

      console.log('Existing lists for board:', boardLists);

   
      if (boardLists.length === 0) {
        console.log('No lists found, creating default lists...');
        boardLists = await createDefaultLists(usedBoard._id);
      }

      
      const listsWithTypes = boardLists.map(list => {
        let validId = list._id;
        
     
        if (!validId || validId.length !== 24) {
          validId = generateObjectId();
          console.log(`Fixed invalid list ID. Old: ${list._id}, New: ${validId}`);
        }
        
        return {
          ...list,
          _id: validId,
          type: list.type || list.name.toLowerCase().replace(' ', ''),
        };
      });

      console.log('Lists with valid IDs:', listsWithTypes.map(l => ({ 
        name: l.name, 
        id: l._id, 
        length: l._id.length,
        type: l.type 
      })));
      
      setAvailableLists(listsWithTypes);

     
      if (preSelectedListId) {
     
        console.log('Using pre-selected list ID:', preSelectedListId, 'Length:', preSelectedListId.length);
        if (preSelectedListId.length === 24) {
          setSelectedListId(preSelectedListId);
        } else {
          console.warn('Pre-selected list ID is invalid, finding by type');
          const targetList = listsWithTypes.find(list => list.type === preSelectedList);
          setSelectedListId(targetList?._id || listsWithTypes[0]?._id || '');
        }
      } else if (preSelectedList) {
  
        console.log('Pre-selected list type:', preSelectedList);
        const targetList = listsWithTypes.find(list => 
          list.type === preSelectedList || 
          list.name.toLowerCase().includes(preSelectedList.toLowerCase())
        );
        console.log('Target list found:', targetList);
        
        if (targetList) {
          console.log('Setting selected list ID to:', targetList._id, 'Length:', targetList._id.length);
          setSelectedListId(targetList._id);
        } else {
          console.log('Target list not found, using first available:', listsWithTypes[0]?._id);
          setSelectedListId(listsWithTypes[0]?._id || '');
        }
      } else {
        console.log('No pre-selected list, using first available:', listsWithTypes[0]?._id);
        setSelectedListId(listsWithTypes[0]?._id || '');
      }
    };

    setupLists();
  }, [usedBoard, lists, preSelectedList, preSelectedListId]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la tarea');
      return;
    }

    if (!usedBoard) {
      Alert.alert('Error', 'No hay tablero seleccionado');
      return;
    }

    if (!selectedListId) {
      Alert.alert('Error', 'Por favor selecciona un estado para la tarea');
      return;
    }

  
    const selectedList = availableLists.find(list => list._id === selectedListId);
    if (!selectedList) {
      Alert.alert('Error', 'Lista seleccionada no válida. Por favor selecciona otra lista.');
      return;
    }
    
    if (selectedListId.length !== 24) {
      Alert.alert('Error', `ID de lista inválido (${selectedListId.length} caracteres). La lista puede no estar inicializada correctamente.`);
      console.error('Invalid listId:', selectedListId, 'Length:', selectedListId.length);
      console.error('Available lists:', availableLists.map(l => ({ name: l.name, id: l._id, length: l._id?.length })));
      return;
    }

    console.log('=== CREATING CARD ===');
    console.log('Board ID:', usedBoard._id);
    console.log('Selected List ID:', selectedListId);
    console.log('Selected List ID length:', selectedListId.length);
    console.log('Selected List:', selectedList);
    console.log('Title:', title.trim());
    console.log('Description:', description.trim());

    setLoading(true);
    
    try {
      const cardData = {
        boardId: usedBoard._id,
        listId: selectedListId,
        title: title.trim(),
        desc: description.trim()
      };

      console.log('Card data to send:', cardData);

      const response = await cardAPI.create(cardData);
      
      console.log('Card created successfully:', response.data);


      const newCard = {
        ...response.data,
        list: selectedListId,
        listId: selectedListId,
        boardId: usedBoard._id,
        order: cards.filter(c => c.boardId === usedBoard._id && (c.list === selectedListId || c.listId === selectedListId)).length
      };

      addCard(newCard);
      
      //Notificacon de tarea
      console.log('=== CREANDO NOTIFICACIÓN DESPUÉS DE CREAR TAREA ===');
      createTaskNotification(
        title.trim(), 
        selectedList.name, 
        selectedList.type, 
        newCard._id 
      );
      
  
      setTitle('');
      setDescription('');
      
      Alert.alert(
        'Éxito', 
        `Tarea "${title.trim()}" creada correctamente y notificación enviada`, 
        [
          { 
            text: 'Ver Notificaciones', 
            onPress: () => navigation.navigate('Notifications'),
            style: 'default'
          },
          { 
            text: 'Crear otra', 
            style: 'default' 
          },
          { 
            text: 'Ver tablero', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
      
    } catch (error: any) {
      console.error('=== ERROR CREATING CARD ===');
      console.error('Error details:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
      
      const localCardId = `temp-${Date.now()}`;
      const localCard = {
        _id: localCardId,
        title: title.trim(),
        desc: description.trim(),
        boardId: usedBoard._id,
        listId: selectedListId,
        list: selectedListId,
        order: cards.filter(c => c.boardId === usedBoard._id && (c.list === selectedListId || c.listId === selectedListId)).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      addCard(localCard);
      
     
      console.log('=== CREANDO NOTIFICACIÓN DESPUÉS DE ERROR (TAREA LOCAL) ===');
      createTaskNotification(
        title.trim(), 
        selectedList.name, 
        selectedList.type, 
        localCardId
      );
      
      
      setTitle('');
      setDescription('');
      
      Alert.alert(
        '⚠️ Tarea creada localmente', 
        `Error del servidor: ${error?.response?.data?.message || error.message}. La tarea se guardó localmente y la notificación fue enviada.`,
        [
          { 
            text: 'Ver Notificaciones', 
            onPress: () => navigation.navigate('Notifications'),
            style: 'default'
          },
          { 
            text: 'Crear otra', 
            style: 'default' 
          },
          { 
            text: 'Ver tablero', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderListOption = (list: any) => {
    console.log('Rendering list option:', list.name, 'ID:', list._id, 'Length:', list._id?.length);
    
    return (
      <TouchableOpacity
        key={list._id}
        style={[
          styles.listOption,
          selectedListId === list._id && styles.listOptionSelected
        ]}
        onPress={() => {
          console.log('List option selected:', list.name, 'ID:', list._id, 'Length:', list._id?.length);
          setSelectedListId(list._id);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.listOptionContent}>
          <View style={[
            styles.colorIndicator,
            { backgroundColor: list.color || '#64748b' }
          ]} />
          <View style={[
            styles.radioButton,
            selectedListId === list._id && styles.radioButtonSelected
          ]}>
            {selectedListId === list._id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
          <Text style={[
            styles.listOptionText,
            selectedListId === list._id && styles.listOptionTextSelected
          ]}>
            {list.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!usedBoard) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No hay tablero seleccionado</Text>
          <Text style={styles.emptySubtitle}>
            Selecciona un tablero para crear tareas
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Tarea</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#203d7f" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Board Info */}
        <View style={styles.boardInfo}>
          <Ionicons name="folder" size={20} color="#64748b" />
          <Text style={styles.boardName}>{usedBoard?.name}</Text>
        </View>

        {/* Nombre de la tarea */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Nombre de la Tarea
            <Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Ej: Revisar documentación del proyecto"
            value={title}
            onChangeText={setTitle}
            multiline
            placeholderTextColor="#94a3b8"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Descripción</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Añade detalles sobre la tarea..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#94a3b8"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Estado (Lista destino) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Estado
            <Text style={styles.required}> *</Text>
          </Text>
          {availableLists.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={24} color="#64748b" />
              <Text style={styles.loadingText}>Preparando listas...</Text>
            </View>
          ) : (
            <View style={styles.listSelector}>
              {availableLists.map(renderListOption)}
            </View>
          )}
        </View>

        {/* Botón crear */}
        <TouchableOpacity 
          style={[
            styles.createButton, 
            (loading || !selectedListId || availableLists.length === 0 || !title.trim()) && styles.createButtonDisabled
          ]}
          onPress={handleCreate}
          disabled={loading || !selectedListId || availableLists.length === 0 || !title.trim()}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={loading ? "hourglass-outline" : "checkmark-circle"} 
            size={20} 
            color="#fff" 
            style={{ marginRight: 8 }}
          />
          <Text style={styles.createButtonText}>
            {loading ? 'Creando Tarea...' : 'Crear Tarea y Notificar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  boardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  boardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0369a1',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  required: {
    color: '#ef4444',
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 60,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  listSelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  listOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#203d7f',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#203d7f',
  },
  listOptionText: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
  },
  listOptionTextSelected: {
    color: '#203d7f',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#203d7f',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#203d7f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});