import React from 'react';
import { Platform, View } from 'react-native';
import { Dialog, Text, Button } from 'react-native-paper';
import ResponsiveDialog, {
  ScrollableContent,
  FixedActions,
} from './ResponsiveDialog';
import { useAppTheme } from '../../theme';
import { usePlatformInfo } from '../../utils/platform';
import EmailSubscriptionForm from './EmailSubscriptionForm';

interface InfoDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ visible, onDismiss }) => {
  const theme = useAppTheme();
  const platformInfo = usePlatformInfo();

  const handleLinkPress = (url: string) => {
    if (platformInfo.isWeb) {
      window.open(url, '_blank');
    }
  };

  return (
    <ResponsiveDialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title
        style={[
          theme.getHeaderStyle('medium'),
          { paddingHorizontal: 16, paddingTop: 16 },
        ]}
      >
        About Chart2AI
      </Dialog.Title>
      <ScrollableContent>
        <Text style={[theme.getTextStyle('body'), { marginBottom: 16 }]}>
          Chart2AI was built by snav:{' '}
          <Text
            style={{
              color: theme.app.colors.primary,
              textDecorationLine: usePlatformInfo().isWeb
                ? 'underline'
                : 'none',
            }}
            onPress={() => handleLinkPress('https://github.com/simpolism')}
          >
            github
          </Text>
          ,{' '}
          <Text
            style={{
              color: theme.app.colors.primary,
              textDecorationLine: usePlatformInfo().isWeb
                ? 'underline'
                : 'none',
            }}
            onPress={() => handleLinkPress('https://x.com/qorprate')}
          >
            X
          </Text>
          .{'\n\n'}
          <Text
            style={{
              color: theme.app.colors.primary,
              textDecorationLine: usePlatformInfo().isWeb
                ? 'underline'
                : 'none',
            }}
            onPress={() => handleLinkPress('mailto:snav@chart2ai.com')}
          >
            Email me
          </Text>{' '}
          with feedback or issues or just to say hello!
        </Text>

        <Text
          style={[
            theme.getTextStyle('body'),
            { marginBottom: 12, fontWeight: 'bold' },
          ]}
        >
          Built with:
        </Text>

        <Text style={[theme.getTextStyle('body'), { marginBottom: 12 }]}>
          •{' '}
          <Text
            style={{
              color: theme.app.colors.primary,
              textDecorationLine: usePlatformInfo().isWeb
                ? 'underline'
                : 'none',
            }}
            onPress={() =>
              handleLinkPress('https://github.com/simpolism/simple-astro-api')
            }
          >
            simple-astro-api
          </Text>{' '}
          for astrological data calculations
        </Text>

        <Text style={[theme.getTextStyle('body'), { marginBottom: 12 }]}>
          •{' '}
          <Text
            style={{
              color: theme.app.colors.primary,
              textDecorationLine: usePlatformInfo().isWeb
                ? 'underline'
                : 'none',
            }}
            onPress={() =>
              handleLinkPress('https://github.com/simpolism/chart2txt')
            }
          >
            chart2txt
          </Text>{' '}
          for chart text generation and prompts
        </Text>

        <Text style={[theme.getTextStyle('body'), { marginBottom: 0 }]}>
          •{' '}
          <Text
            style={{
              color: theme.app.colors.primary,
              textDecorationLine: usePlatformInfo().isWeb
                ? 'underline'
                : 'none',
            }}
            onPress={() => handleLinkPress('https://photon.komoot.io/')}
          >
            Photon Geocoding API
          </Text>{' '}
          for location services
        </Text>
        <View style={{ marginTop: 16 }}>
          <EmailSubscriptionForm />
        </View>
      </ScrollableContent>
      <FixedActions>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button onPress={onDismiss}>Close</Button>
        </View>
      </FixedActions>
    </ResponsiveDialog>
  );
};

export default InfoDialog;
