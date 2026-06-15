import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../theme';
import { usePlatformInfo } from '../../utils/platform';

interface WebResponsiveContainerProps {
  children: React.ReactNode;
  includeScrollbarStyling?: boolean;
}

const WebResponsiveContainer: React.FC<WebResponsiveContainerProps> = ({
  children,
  includeScrollbarStyling = true,
}) => {
  const theme = useAppTheme();
  const platformInfo = usePlatformInfo();

  // Inject scrollbar styling and gradient blend for web
  React.useEffect(() => {
    if (platformInfo.isWeb && includeScrollbarStyling) {
      const style = document.createElement('style');
      style.textContent = `
        /* Body background and gradient blend */
        html, body {
          background: ${theme.app.colors.background};
          margin: 0;
          padding: 0;
        }
        
        /* Gradient blend overlay for container edges */
        body::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
          background: 
            linear-gradient(90deg, 
              rgba(0, 0, 0, 0.4) 0%, 
              rgba(26, 13, 46, 0.6) calc(50% - 450px), 
              rgba(26, 13, 46, 0.3) calc(50% - 420px),
              transparent calc(50% - 400px),
              transparent calc(50% + 400px),
              rgba(26, 13, 46, 0.3) calc(50% + 420px),
              rgba(26, 13, 46, 0.6) calc(50% + 450px),
              rgba(0, 0, 0, 0.4) 100%
            );
        }
        
        /* Custom scrollbar styling for Chart2AI */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${theme.app.colors.background};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.app.colors.primary};
          border-radius: 4px;
          border: 1px solid ${theme.app.colors.background};
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.app.colors.interactive};
        }
        
        ::-webkit-scrollbar-corner {
          background: ${theme.app.colors.background};
        }
        
        /* Firefox scrollbar styling */
        html, body, div, span {
          scrollbar-width: thin;
          scrollbar-color: ${theme.app.colors.primary} ${theme.app.colors.background};
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [includeScrollbarStyling, theme]);

  return (
    <View
      style={{
        flex: 1,
        ...(platformInfo.isWeb && {
          maxWidth: 800,
          alignSelf: 'center',
          width: '100%',
        }),
      }}
    >
      {children}
    </View>
  );
};

export default WebResponsiveContainer;
