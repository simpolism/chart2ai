import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../theme';

interface SectionDividerProps {
  marginVertical?: number;
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  marginVertical = 16,
}) => {
  const theme = useAppTheme();

  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.app.colors.border,
        marginVertical,
        opacity: 0.3,
      }}
    />
  );
};

export default SectionDivider;
