import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Dialog,
  Text,
  Button,
  TextInput,
  Chip,
  Card,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { SavedResult } from '../../types';
import { formatDateToMDY } from '../../utils/dateUtils';
import {
  getAllResults,
  deleteResult,
  updateResultName,
  generateResultSummary,
} from '../../utils/resultStorage';
import ResponsiveDialog, {
  ScrollableContent,
  FixedActions,
} from '../shared/ResponsiveDialog';
import ChartResultDialog from '../chart-results/ChartResultDialog';
import { useAppTheme } from '../../theme';

interface ResultLibraryProps {
  visible: boolean;
  onDismiss: () => void;
  onLoadResult: (result: SavedResult) => void;
  onLoadForm: (result: SavedResult) => void;
}

interface ResultItemProps {
  result: SavedResult;
  onView: (result: SavedResult) => void;
  onLoad: (result: SavedResult) => void;
  onRename: (result: SavedResult) => void;
  onDelete: (result: SavedResult) => void;
}

const ResultItem: React.FC<ResultItemProps> = ({
  result,
  onView,
  onLoad,
  onRename,
  onDelete,
}) => {
  const theme = useAppTheme();

  return (
    <Card
      style={[
        theme.getCardStyle(),
        {
          marginHorizontal: 16,
          marginVertical: 4,
          backgroundColor: theme.app.colors.surfaceVariant,
          borderWidth: 1,
          borderColor: theme.app.colors.border,
        },
      ]}
    >
      <Card.Content>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              variant="titleMedium"
              style={[theme.getHeaderStyle('small'), { marginBottom: 4 }]}
              numberOfLines={2}
            >
              {result.name}
            </Text>
            <Chip
              style={{
                backgroundColor: theme.app.colors.surface,
                height: 32,
                alignSelf: 'flex-start',
                borderWidth: 1,
                borderColor: theme.app.colors.primary,
                marginBottom: 8,
              }}
              textStyle={{
                fontSize: 10,
                color: theme.app.colors.primary,
              }}
              compact
            >
              {formatDateToMDY(result.timestamp)}{' '}
              {result.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Chip>
            <Text
              style={[
                theme.getTextStyle('body'),
                { lineHeight: 18, fontSize: 13 },
              ]}
              numberOfLines={3}
            >
              {generateResultSummary(result)}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="eye"
              size={20}
              iconColor={theme.getIconColor('primary')}
              onPress={() => onView(result)}
            />
            <IconButton
              icon="form-select"
              size={20}
              iconColor={theme.getIconColor('primary')}
              onPress={() => onLoad(result)}
            />
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.getIconColor('primary')}
              onPress={() => onRename(result)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.getIconColor('error')}
              onPress={() => onDelete(result)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const ResultLibrary: React.FC<ResultLibraryProps> = ({
  visible,
  onDismiss,
  onLoadResult,
  onLoadForm,
}) => {
  const theme = useAppTheme();
  const [results, setResults] = useState<SavedResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    result: SavedResult | null;
  }>({
    visible: false,
    result: null,
  });

  const [renameDialog, setRenameDialog] = useState<{
    visible: boolean;
    result: SavedResult | null;
    newName: string;
  }>({
    visible: false,
    result: null,
    newName: '',
  });

  const [infoDialog, setInfoDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const [resultDialog, setResultDialog] = useState<{
    visible: boolean;
    result: SavedResult | null;
  }>({
    visible: false,
    result: null,
  });

  useEffect(() => {
    if (visible) {
      loadResults();
    }
  }, [visible]);

  const loadResults = async () => {
    setLoading(true);
    try {
      const allResults = await getAllResults();
      setResults(allResults);
    } catch (error) {
      console.error('Error loading results:', error);
      setInfoDialog({
        visible: true,
        title: 'Error',
        message: 'Failed to load saved results',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (result: SavedResult) => {
    setDeleteDialog({
      visible: true,
      result,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.result) return;

    try {
      await deleteResult(deleteDialog.result.id);
      await loadResults();
      setDeleteDialog({ visible: false, result: null });
    } catch (error) {
      console.error('Error deleting result:', error);
      setDeleteDialog({ visible: false, result: null });
      setInfoDialog({
        visible: true,
        title: 'Error',
        message: 'Failed to delete result',
      });
    }
  };

  const handleRename = (result: SavedResult) => {
    setRenameDialog({
      visible: true,
      result,
      newName: result.name,
    });
  };

  const handleRenameConfirm = async () => {
    if (!renameDialog.result || !renameDialog.newName.trim()) return;

    try {
      await updateResultName(
        renameDialog.result.id,
        renameDialog.newName.trim()
      );
      await loadResults();
      setRenameDialog({ visible: false, result: null, newName: '' });
    } catch (error) {
      console.error('Error renaming result:', error);
      setRenameDialog({ visible: false, result: null, newName: '' });
      setInfoDialog({
        visible: true,
        title: 'Error',
        message: 'Failed to rename result',
      });
    }
  };

  const handleLoadResult = (result: SavedResult) => {
    setResultDialog({
      visible: true,
      result,
    });
    // Keep Result Library open when viewing results
  };

  const handleLoadForm = (result: SavedResult) => {
    onLoadForm(result);
    onDismiss(); // Close when loading form data
  };

  const renderEmptyState = () => (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
      }}
    >
      <Text
        variant="headlineSmall"
        style={[
          theme.getHeaderStyle('medium'),
          { marginBottom: 12, textAlign: 'center' },
        ]}
      >
        No Results Saved Yet
      </Text>
      <Text
        variant="bodyMedium"
        style={[
          theme.getTextStyle('caption'),
          { textAlign: 'center', lineHeight: 20 },
        ]}
      >
        Generate a chart to create your first result.
      </Text>
    </View>
  );

  return (
    <>
      <ResponsiveDialog
        visible={visible}
        onDismiss={onDismiss}
        dismissable={true}
      >
        <Dialog.Title
          style={[
            theme.getHeaderStyle('medium'),
            { paddingHorizontal: 16, paddingTop: 16 },
          ]}
        >
          Result Library ({results.length}/100)
        </Dialog.Title>

        <ScrollableContent>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator size="large" />
              <Text style={[theme.getTextStyle('body'), { marginTop: 16 }]}>
                Loading results...
              </Text>
            </View>
          ) : results.length === 0 ? (
            renderEmptyState()
          ) : (
            <View>
              {results.map(result => (
                <ResultItem
                  key={result.id}
                  result={result}
                  onView={handleLoadResult}
                  onLoad={handleLoadForm}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}
        </ScrollableContent>

        <FixedActions>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button onPress={onDismiss}>Close</Button>
          </View>
        </FixedActions>
      </ResponsiveDialog>

      {/* Delete Dialog */}
      <ResponsiveDialog
        visible={deleteDialog.visible}
        onDismiss={() => setDeleteDialog({ visible: false, result: null })}
      >
        <Dialog.Title>Delete Result</Dialog.Title>
        <Dialog.Content>
          <Text>
            Are you sure you want to delete "{deleteDialog.result?.name}"?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => setDeleteDialog({ visible: false, result: null })}
          >
            Cancel
          </Button>
          <Button
            onPress={handleDeleteConfirm}
            buttonColor={theme.app.colors.error}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </ResponsiveDialog>

      {/* Rename Dialog */}
      <ResponsiveDialog
        visible={renameDialog.visible}
        onDismiss={() =>
          setRenameDialog({ visible: false, result: null, newName: '' })
        }
      >
        <Dialog.Title>Rename Result</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Result Name"
            value={renameDialog.newName}
            onChangeText={text =>
              setRenameDialog(prev => ({ ...prev, newName: text }))
            }
            mode="outlined"
            style={{ backgroundColor: theme.app.colors.surface }}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() =>
              setRenameDialog({ visible: false, result: null, newName: '' })
            }
          >
            Cancel
          </Button>
          <Button
            onPress={handleRenameConfirm}
            disabled={!renameDialog.newName.trim()}
          >
            Save
          </Button>
        </Dialog.Actions>
      </ResponsiveDialog>

      {/* Info Dialog */}
      <ResponsiveDialog
        visible={infoDialog.visible}
        onDismiss={() =>
          setInfoDialog({ visible: false, title: '', message: '' })
        }
      >
        <Dialog.Title>{infoDialog.title}</Dialog.Title>
        <Dialog.Content>
          <Text>{infoDialog.message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() =>
              setInfoDialog({ visible: false, title: '', message: '' })
            }
          >
            OK
          </Button>
        </Dialog.Actions>
      </ResponsiveDialog>

      {/* Chart Result Dialog */}
      {resultDialog.result ? (
        <ChartResultDialog
          visible={resultDialog.visible}
          onDismiss={() => setResultDialog({ visible: false, result: null })}
          displayText={resultDialog.result.displayText}
          formData={resultDialog.result.formData}
        />
      ) : null}
    </>
  );
};

export default ResultLibrary;
