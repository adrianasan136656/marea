import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Sound } from '../screens/CrearMareaScreen';

interface SoundSelectorProps {
  selectedSounds: Sound[];
  onToggleSound: (sound: Sound) => Promise<void>;
  volumes?: Record<string, number>;
  onVolumeChange?: (id: string, value: number) => void;
}

const availableSounds: Sound[] = [
  { id: 'arpa', label: 'Arpa', uri: 'https://drive.google.com/uc?export=download&id=11EojLqCB3-lnfKkh8iMjwlGwKQlEv_a_' },
  { id: 'boligrafo', label: 'Bolígrafo', uri: 'https://drive.google.com/uc?export=download&id=1RI9Xl25xxYM0yw4YDjv4oXKvnkvPKs5N' },
  { id: 'brillos', label: 'Brillos', uri: 'https://drive.google.com/uc?export=download&id=1C5Tk-tCXWLA1BEmahQxJwJl9mEjw2Vq0' },
  { id: 'calles', label: 'Ciudad', uri: 'https://drive.google.com/uc?export=download&id=1h-YucY8zzTyW2AhnEPmB-pnr5hgIbiOg' },
  { id: 'campanas', label: 'Campanas', uri: 'https://drive.google.com/uc?export=download&id=1Dkh9FGCL6ISubN3DmNHbl84zDmB-EDtA' },
  { id: 'eco', label: 'Eco', uri: 'https://drive.google.com/uc?export=download&id=1Bm7jMlCAcuiy6kIum0VyENzi_XMY_5MR' },
  { id: 'flauta', label: 'Flauta', uri: 'https://drive.google.com/uc?export=download&id=1Jbjc-wZuah6miXJVqq9qAVDx3Jq3V5WT' },
  { id: 'fogata', label: 'Fogata', uri: 'https://drive.google.com/uc?export=download&id=1T5KtKiWVADequOR_X5jO0_8p-b-_6kCz' },
  { id: 'latido', label: 'Latidos', uri: 'https://drive.google.com/uc?export=download&id=1iTfcISCZe_OiPD0NlJG4-G4zmYnYXSwY' },
  { id: 'madera', label: 'Madera', uri: 'https://drive.google.com/uc?export=download&id=1sZrDvT4PitdVHRU0jw-9526heWsxcQT_' },
  { id: 'metro', label: 'Metro', uri: 'https://drive.google.com/uc?export=download&id=1HOqYDjwDXKFt_73-M_suK2DNH0Fr3SD-' },
  { id: 'pajaros', label: 'Pájaros', uri: 'https://drive.google.com/uc?export=download&id=1VVTJO4aph__lclC4ym75LgvX36TsJBfH' },
  { id: 'payaso', label: 'Payaso', uri: 'https://drive.google.com/uc?export=download&id=1p1jmP4ktlDGj_xbV1AAHOZK9QeDOQ9pO' },
  { id: 'piano', label: 'Piano', uri: 'https://docs.google.com/uc?export=download&id=1JAElEXerfdfyCqR45CKZvLLN7NQ6QrC6' },
  { id: 'playa', label: 'Playa', uri: 'https://drive.google.com/uc?export=download&id=1DYcfg5d7NEE5UmIREY_VjnRRB23n0xFw' },
  { id: 'reloj', label: 'Reloj', uri: 'https://drive.google.com/uc?export=download&id=163jTcZkuQEcnV-766rqqd9xKiewfmhhU' },
  { id: 'silbido', label: 'Silbido', uri: 'https://drive.google.com/uc?export=download&id=1FJjTUja9N8DOWy2yElfyWJzjwSXK-eiZ' },
  { id: 'viento', label: 'Viento', uri: 'https://drive.google.com/uc?export=download&id=1oE53Y0BYdU9-SieA8CJ-uabKJaR6BfP6' },
  { id: 'violin', label: 'Violín', uri: 'https://drive.google.com/uc?export=download&id=1U99wmsaTQFYNuyw1m7EGu-0sxuTsGLEF' },
];

const SoundSelector: React.FC<SoundSelectorProps> = ({
  selectedSounds,
  onToggleSound,
  volumes = {},
  onVolumeChange,
}) => {
  const isSelected = (sound: Sound) => {
    return selectedSounds.some((s) => s.id === sound.id);
  };

  return (
    <FlatList
      data={availableSounds}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const selected = isSelected(item);
        return (
          <View style={styles.soundItem}>
            <TouchableOpacity
              style={[styles.button, selected && styles.selected]}
              onPress={() => onToggleSound(item)}
            >
              <Text style={styles.label}>{selected ? '✅' : '＋'} {item.label}</Text>
            </TouchableOpacity>
            {selected && onVolumeChange && (
              <Slider
                style={{ width: '100%' }}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={volumes[item.id] || 1}
                onValueChange={(value) => onVolumeChange(item.id, value)}
                minimumTrackTintColor="#1fb28a"
                maximumTrackTintColor="#ccc"
              />
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  soundItem: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: '#c1f4e2',
  },
  label: {
    fontSize: 16,
  },
});

export default SoundSelector;
