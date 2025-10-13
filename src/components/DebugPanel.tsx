import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { debugDataLoading, createTestProfile, cleanupTestData } from '../lib/debugDataLoading';
import { forceLoadAllDataFromSupabase, forceReloadAllDataFromSupabase, sessionStorage } from '../lib/storage';
import { initializeUserData, checkAndFixUserData } from '../lib/initializeUserData';

export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleDebugDataLoading = async () => {
    addLog('🔍 Début du debug...');
    try {
      await debugDataLoading();
      addLog('✅ Debug terminé');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleCreateTestProfile = async () => {
    addLog('🧪 Création profil de test...');
    try {
      await createTestProfile();
      addLog('✅ Profil de test créé');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleForceLoad = async () => {
    addLog('🔄 Chargement forcé...');
    try {
      await forceLoadAllDataFromSupabase();
      addLog('✅ Chargement forcé terminé');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleCleanup = async () => {
    addLog('🧹 Nettoyage...');
    try {
      await cleanupTestData();
      addLog('✅ Nettoyage terminé');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleInitialize = async () => {
    addLog('🚀 Initialisation...');
    try {
      await initializeUserData();
      addLog('✅ Initialisation terminée');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleCheckData = async () => {
    addLog('🔍 Vérification...');
    try {
      await checkAndFixUserData();
      addLog('✅ Vérification terminée');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleForceReload = async () => {
    addLog('🔄 Rechargement forcé...');
    try {
      await forceReloadAllDataFromSupabase();
      addLog('✅ Rechargement forcé terminé');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleDebugSession = async () => {
    addLog('⏱️ Debug session chrono...');
    try {
      const session = await sessionStorage.get();
      addLog(`📊 Session actuelle:`);
      addLog(`  - isRunning: ${session.isRunning}`);
      addLog(`  - startTimestamp: ${session.startTimestamp}`);
      addLog(`  - elapsedBeforePause: ${session.elapsedBeforePause}ms`);
      
      if (session.startTimestamp) {
        const now = Date.now();
        const elapsed = now - session.startTimestamp + session.elapsedBeforePause;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        addLog(`  - Temps écoulé: ${hours}h ${minutes}m ${seconds}s`);
      }
      
      addLog('✅ Debug session terminé');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const handleResetSession = async () => {
    addLog('🔄 Reset session...');
    try {
      await sessionStorage.resetForNewUser();
      addLog('✅ Session réinitialisée');
    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleDebugDataLoading}>
          <Text style={styles.buttonText}>Debug Chargement</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleCreateTestProfile}>
          <Text style={styles.buttonText}>Créer Profil Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleForceLoad}>
          <Text style={styles.buttonText}>Chargement Forcé</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleForceReload}>
          <Text style={styles.buttonText}>Recharger Tout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleInitialize}>
          <Text style={styles.buttonText}>Initialiser</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleCheckData}>
          <Text style={styles.buttonText}>Vérifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleDebugSession}>
          <Text style={styles.buttonText}>Debug Chrono</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleResetSession}>
          <Text style={styles.buttonText}>Reset Chrono</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleCleanup}>
          <Text style={styles.buttonText}>Nettoyer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Effacer Logs</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logsContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#F8FAFC',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '45%',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 11,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 6,
    padding: 8,
    minHeight: 150,
  },
  logText: {
    color: '#00FF00',
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: 1,
  },
});
