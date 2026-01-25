import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { providerService } from '../../services';
import type {
  VerificationDocument,
  DocumentType,
  ProviderType,
  DOCUMENT_TYPE_LABELS,
  REQUIRED_DOCUMENTS,
  RECOMMENDED_DOCUMENTS,
} from '../../types/provider';

interface Props {
  providerType: ProviderType;
  onComplete?: () => void;
  onSkip?: () => void;
}

interface DocumentItem {
  type: DocumentType;
  label: string;
  required: boolean;
  description: string;
  accepted: string;
}

const getDocumentsForType = (type: ProviderType): DocumentItem[] => {
  if (type === 'individual') {
    return [
      {
        type: 'national_id',
        label: 'Cédula de identidad / DNI',
        required: true,
        description: 'Foto clara de ambos lados de tu documento',
        accepted: 'JPG, PNG o PDF',
      },
      {
        type: 'guide_certification',
        label: 'Certificación de guía turístico',
        required: false,
        description: 'Si tienes certificación oficial, súbela aquí',
        accepted: 'JPG, PNG o PDF',
      },
    ];
  }

  return [
    {
      type: 'tax_id',
      label: 'RUT / RFC de la empresa',
      required: true,
      description: 'Documento oficial de registro tributario',
      accepted: 'PDF',
    },
    {
      type: 'business_license',
      label: 'Permiso de operación turística',
      required: true,
      description: 'Licencia o permiso para operar tours',
      accepted: 'PDF',
    },
    {
      type: 'insurance',
      label: 'Seguro de responsabilidad civil',
      required: false,
      description: 'Póliza de seguro vigente (recomendado)',
      accepted: 'PDF',
    },
    {
      type: 'national_id',
      label: 'Cédula del representante legal',
      required: true,
      description: 'Documento del representante de la empresa',
      accepted: 'JPG, PNG o PDF',
    },
  ];
};

export const DocumentUploadScreen: React.FC<Props> = ({
  providerType,
  onComplete,
  onSkip,
}) => {
  const [documents, setDocuments] = useState<Record<DocumentType, VerificationDocument | null>>({
    national_id: null,
    tax_id: null,
    business_license: null,
    insurance: null,
    guide_certification: null,
    other: null,
  });
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const documentItems = getDocumentsForType(providerType);
  const requiredDocs = documentItems.filter((d) => d.required);
  const optionalDocs = documentItems.filter((d) => !d.required);

  useEffect(() => {
    loadExistingDocuments();
  }, []);

  const loadExistingDocuments = async () => {
    try {
      const response = await providerService.getMyDocuments();
      if (response.success && response.data) {
        const docsMap: Record<DocumentType, VerificationDocument | null> = {
          national_id: null,
          tax_id: null,
          business_license: null,
          insurance: null,
          guide_certification: null,
          other: null,
        };
        response.data.forEach((doc) => {
          docsMap[doc.type] = doc;
        });
        setDocuments(docsMap);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async (docType: DocumentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      await uploadDocument(docType, file.uri, file.name, file.mimeType || 'application/octet-stream');
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const pickImage = async (docType: DocumentType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Necesitamos acceso a tu galería para subir documentos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || 'document.jpg';
      await uploadDocument(docType, asset.uri, fileName, 'image/jpeg');
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async (docType: DocumentType) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Necesitamos acceso a tu cámara para tomar fotos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileName = `document_${Date.now()}.jpg`;
      await uploadDocument(docType, asset.uri, fileName, 'image/jpeg');
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const uploadDocument = async (
    docType: DocumentType,
    uri: string,
    fileName: string,
    mimeType: string
  ) => {
    setUploading(docType);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: mimeType,
      } as any);
      formData.append('type', docType);

      const response = await providerService.uploadDocument(formData);

      if (response.success) {
        setDocuments((prev) => ({
          ...prev,
          [docType]: response.data,
        }));
        Alert.alert('Éxito', 'Documento subido correctamente');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo subir el documento');
    } finally {
      setUploading(null);
    }
  };

  const deleteDocument = async (docType: DocumentType) => {
    const doc = documents[docType];
    if (!doc) return;

    Alert.alert(
      'Eliminar documento',
      '¿Estás seguro de que quieres eliminar este documento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await providerService.deleteDocument(doc.id);
              setDocuments((prev) => ({
                ...prev,
                [docType]: null,
              }));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const showUploadOptions = (docType: DocumentType, acceptsPdf: boolean) => {
    const options = [
      { text: 'Cancelar', style: 'cancel' as const },
      { text: '📷 Tomar foto', onPress: () => takePhoto(docType) },
      { text: '🖼️ Galería', onPress: () => pickImage(docType) },
    ];

    if (acceptsPdf) {
      options.push({ text: '📄 Documento PDF', onPress: () => pickDocument(docType) });
    }

    Alert.alert('Subir documento', 'Elige cómo quieres agregar el documento', options);
  };

  const handleSubmit = async () => {
    // Check required documents
    const missingRequired = requiredDocs.filter((d) => !documents[d.type]);
    if (missingRequired.length > 0) {
      Alert.alert(
        'Documentos faltantes',
        `Por favor sube los siguientes documentos:\n${missingRequired.map((d) => `• ${d.label}`).join('\n')}`
      );
      return;
    }

    setSubmitting(true);
    try {
      await providerService.requestVerification();
      Alert.alert(
        '¡Solicitud enviada!',
        'Revisaremos tus documentos y te notificaremos por correo.',
        [{ text: 'OK', onPress: onComplete }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const getUploadedCount = () => {
    return requiredDocs.filter((d) => documents[d.type]).length;
  };

  const renderDocumentCard = (item: DocumentItem) => {
    const doc = documents[item.type];
    const isUploading = uploading === item.type;
    const acceptsPdf = item.accepted.toLowerCase().includes('pdf');

    return (
      <View key={item.type} style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <View style={styles.documentTitleRow}>
              <Text style={styles.documentLabel}>{item.label}</Text>
              {item.required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Requerido</Text>
                </View>
              )}
            </View>
            <Text style={styles.documentDescription}>{item.description}</Text>
            <Text style={styles.documentAccepted}>Formatos: {item.accepted}</Text>
          </View>
        </View>

        {doc ? (
          <View style={styles.uploadedContainer}>
            <View style={styles.uploadedInfo}>
              <Text style={styles.uploadedIcon}>
                {doc.status === 'approved' ? '✅' : doc.status === 'rejected' ? '❌' : '⏳'}
              </Text>
              <View style={styles.uploadedTextContainer}>
                <Text style={styles.uploadedName} numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text
                  style={[
                    styles.uploadedStatus,
                    doc.status === 'approved' && styles.statusApproved,
                    doc.status === 'rejected' && styles.statusRejected,
                  ]}
                >
                  {doc.status === 'approved'
                    ? 'Aprobado'
                    : doc.status === 'rejected'
                    ? 'Rechazado'
                    : 'En revisión'}
                </Text>
                {doc.status === 'rejected' && doc.rejectionReason && (
                  <Text style={styles.rejectionReason}>{doc.rejectionReason}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteDocument(item.type)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={() => showUploadOptions(item.type, acceptsPdf)}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.uploadButtonIcon}>📤</Text>
                <Text style={styles.uploadButtonText}>Subir documento</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando documentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📋</Text>
          <Text style={styles.title}>Documentos de verificación</Text>
          <Text style={styles.subtitle}>
            Sube los documentos necesarios para verificar tu cuenta
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(getUploadedCount() / requiredDocs.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {getUploadedCount()} de {requiredDocs.length} documentos requeridos
          </Text>
        </View>

        {/* Required Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos requeridos</Text>
          {requiredDocs.map(renderDocumentCard)}
        </View>

        {/* Optional Documents */}
        {optionalDocs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentos opcionales</Text>
            <Text style={styles.sectionSubtitle}>
              Estos documentos pueden acelerar tu aprobación
            </Text>
            {optionalDocs.map(renderDocumentCard)}
          </View>
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>
            Tus documentos están protegidos y solo serán utilizados para verificar tu identidad.
            Nunca compartiremos tu información con terceros.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={submitting ? 'Enviando...' : 'Enviar para revisión'}
            onPress={handleSubmit}
            loading={submitting}
            fullWidth
            disabled={getUploadedCount() < requiredDocs.length}
          />

          {onSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Completar más tarde</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  documentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  documentHeader: {
    marginBottom: Spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  documentLabel: {
    ...Typography.labelLarge,
    color: Colors.text,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  documentDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  documentAccepted: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  uploadButtonText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    padding: Spacing.sm,
    borderRadius: 8,
  },
  uploadedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadedIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  uploadedTextContainer: {
    flex: 1,
  },
  uploadedName: {
    ...Typography.label,
    color: Colors.text,
  },
  uploadedStatus: {
    ...Typography.caption,
    color: Colors.warning,
  },
  statusApproved: {
    color: Colors.success,
  },
  statusRejected: {
    color: Colors.error,
  },
  rejectionReason: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    ...Typography.bodySmall,
    color: Colors.info,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  skipButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
});
