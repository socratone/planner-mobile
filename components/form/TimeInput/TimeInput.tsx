import { StyleSheet, Text, TextInput, View } from 'react-native';

interface TimeInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const TimeInput = ({ value, onChange }: TimeInputProps) => {
  const handleHourChange = (text: string) => {
    onChange([text, value[1]]);
  };

  const handleMinuteChange = (text: string) => {
    onChange([value[0], text]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>시간</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="시"
          value={value[0]}
          onChangeText={handleHourChange}
          maxLength={2}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>분</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="분"
          value={value[1]}
          onChangeText={handleMinuteChange}
          maxLength={2}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    width: 50,
    color: 'white',
    fontSize: 18,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    height: 48,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    color: 'white',
  },
});

export default TimeInput;
