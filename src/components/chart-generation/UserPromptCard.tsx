import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Switch, Card, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import UserPromptEditor from './UserPromptEditor';

interface UserPromptCardProps {
  enableUserPrompt: boolean;
  userPromptText: string;
  onEnableUserPromptChange: (enabled: boolean) => void;
  onUserPromptTextChange: (text: string) => void;
}

const UserPromptCard: React.FC<UserPromptCardProps> = ({
  enableUserPrompt,
  userPromptText,
  onEnableUserPromptChange,
  onUserPromptTextChange,
}) => {
  const theme = useAppTheme();

  const toggleUserPrompt = () => {
    onEnableUserPromptChange(!enableUserPrompt);
  };

  return (
    <Card style={theme.getCardStyle()}>
      <TouchableOpacity onPress={toggleUserPrompt} activeOpacity={0.7}>
        <Card.Content>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 16,
            }}
          >
            <Text style={theme.getHeaderStyle('medium')}>Add Extra Info</Text>
            <Switch
              value={enableUserPrompt}
              onValueChange={onEnableUserPromptChange}
              {...theme.getSwitchProps()}
            />
          </View>
        </Card.Content>
      </TouchableOpacity>

      {enableUserPrompt ? (
        <Card.Content style={{ paddingTop: 0 }}>
          <HelperText type="info" style={{ marginTop: -8, marginBottom: 16 }}>
            Provide context to guide the reading (e.g., "These are romantic
            partners" or "Mother and daughter relationship"). Ask specific
            questions later in your ChatGPT conversation.
          </HelperText>
          <UserPromptEditor
            userPromptText={userPromptText}
            onTextChange={onUserPromptTextChange}
          />
        </Card.Content>
      ) : null}
    </Card>
  );
};

export default UserPromptCard;
