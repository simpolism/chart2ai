import React from 'react';
import { View } from 'react-native';
import { Text, TextInput, HelperText, Button } from 'react-native-paper';
import { useAppTheme } from '../../theme';

interface UserPromptEditorProps {
  userPromptText: string;
  onTextChange: (text: string) => void;
}

const UserPromptEditor: React.FC<UserPromptEditorProps> = ({
  userPromptText,
  onTextChange,
}) => {
  const theme = useAppTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        value={userPromptText}
        onChangeText={onTextChange}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={[
          theme.getInputStyle(),
          {
            minHeight: 120,
            backgroundColor: theme.app.colors.surface,
          },
        ]}
        contentStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingTop: 20,
        }}
        placeholderTextColor={theme.app.colors.disabled}
        theme={{
          colors: {
            onSurfaceVariant: theme.app.colors.onSurface,
            primary: theme.app.colors.primary,
            outline: theme.app.colors.border,
            onSurfaceDisabled: theme.app.colors.disabled,
          },
        }}
        placeholder="Analyze the dynamic of this group of friends."
      />

      <Button
        mode="outlined"
        disabled={!userPromptText.trim()}
        onPress={() => onTextChange('')}
        style={{
          marginTop: 8,
          borderColor: userPromptText.trim()
            ? theme.app.colors.border
            : theme.app.colors.disabled,
          borderWidth: 1,
        }}
        labelStyle={{
          color: userPromptText.trim()
            ? theme.app.colors.primary
            : theme.app.colors.disabled,
        }}
        buttonColor="transparent"
      >
        Clear
      </Button>
    </View>
  );
};

export default UserPromptEditor;
