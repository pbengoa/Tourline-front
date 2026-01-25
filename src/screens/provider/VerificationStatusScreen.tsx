import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { providerService } from '../../services';
import type { Provider, ProviderStatus, VerificationDocument } from '../../types/provider';
import { PROVIDER_STATUS_CONFIG } from '../../types/provider';

interface Props {
  onUploadDocuments?: () => void;
  onEditProfile?: () => void;
}

export const VerificationStatusScreen: React.FC<Props> = ({
  onUploadDocuments,
  onEditProfile,
}) => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [providerRes, docsRes] = await Promise.all([
        providerService.getMyProvider(),
        providerService.getMyDocuments(),
      ]);

      if (providerRes.success) {
        setProvider(providerRes.data);
      }
      if (docsRes.success) {
        setDocuments(docsRes.data);
      }
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:soporte@tourline.com?subject=Consulta sobre verificación');
  };

  const getStatusConfig = (status: ProviderStatus) => {
    return PROVIDER_STATUS_CONFIG[status] || PROVIDER_STATUS_CONFIG.pending;
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getDocumentStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'En revisión';
    }
  };

  const renderTimeline = () => {
    const steps = [
      {
        title: 'Registro completado',
        description: 'Tu cuenta ha sido creada',
        completed: true,
        current: false,
      },
      {
        title: 'Email verificado',
        description: 'Tu correo ha sido confirmado',
        completed: true, // Assume verified if they're logged in
        current: false,
      },
      {
        title: 'Documentos subidos',
        description: 'Documentación de verificación',
        completed: documents.length > 0,
        current: provider?.status === 'pending' && documents.length === 0,
      },
      {
        title: 'En revisión',
        description: 'Tourline está verificando tu cuenta',
        completed: provider?.status === 'approved',
        current: provider?.status === 'in_review',
      },
      {
        title: 'Cuenta aprobada',
        description: 'Puedes empezar a crear tours',
        completed: provider?.status === 'approved',
        current: false,
      },
    ];

    return (
      <View style={styles.timeline}>
        {steps.map((step, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineDot,
                  step.completed && styles.timelineDotCompleted,
                  step.current && styles.timelineDotCurrent,
                ]}
              >
                {step.completed && <Text style={styles.timelineCheck}>✓</Text>}
                {step.current && <View style={styles.timelinePulse} />}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    step.completed && styles.timelineLineCompleted,
                  ]}
                />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineTitle,
                  step.completed && styles.timelineTitleCompleted,
                  step.current && styles.timelineTitleCurrent,
                ]}
              >
                {step.title}
              </Text>
              <Text style={styles.timelineDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando estado...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>No se pudo cargar tu perfil</Text>
          <Button title="Reintentar" onPress={loadData} />
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(provider.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Header */}
        <View style={[styles.statusCard, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>

          {provider.status === 'rejected' && provider.statusMessage && (
            <View style={styles.rejectionReason}>
              <Text style={styles.rejectionTitle}>Motivo:</Text>
              <Text style={styles.rejectionText}>{provider.statusMessage}</Text>
            </View>
          )}
        </View>

        {/* Provider Info */}
        <View style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>
                {provider.type === 'company' ? '🏢' : '👤'}
              </Text>
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerType}>
                {provider.type === 'company' ? 'Empresa de Tours' : 'Guía Independiente'}
              </Text>
            </View>
            {onEditProfile && (
              <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.providerDetails}>
            <View style={styles.providerDetailRow}>
              <Text style={styles.providerDetailIcon}>📧</Text>
              <Text style={styles.providerDetailText}>{provider.email}</Text>
            </View>
            <View style={styles.providerDetailRow}>
              <Text style={styles.providerDetailIcon}>📍</Text>
              <Text style={styles.providerDetailText}>
                {provider.city}, {provider.country}
              </Text>
            </View>
            {provider.type === 'company' && provider.taxId && (
              <View style={styles.providerDetailRow}>
                <Text style={styles.providerDetailIcon}>📋</Text>
                <Text style={styles.providerDetailText}>RUT: {provider.taxId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso de verificación</Text>
          {renderTimeline()}
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documentos</Text>
            {onUploadDocuments && (
              <TouchableOpacity onPress={onUploadDocuments}>
                <Text style={styles.sectionAction}>
                  {documents.length > 0 ? 'Editar' : 'Subir'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {documents.length === 0 ? (
            <View style={styles.noDocuments}>
              <Text style={styles.noDocumentsIcon}>📄</Text>
              <Text style={styles.noDocumentsText}>
                No has subido documentos aún
              </Text>
              {onUploadDocuments && (
                <Button
                  title="Subir documentos"
                  onPress={onUploadDocuments}
                  variant="outline"
                  size="small"
                  style={styles.uploadButton}
                />
              )}
            </View>
          ) : (
            <View style={styles.documentsList}>
              {documents.map((doc) => (
                <View key={doc.id} style={styles.documentItem}>
                  <Text style={styles.documentIcon}>
                    {getDocumentStatusIcon(doc.status)}
                  </Text>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName} numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <Text
                      style={[
                        styles.documentStatus,
                        doc.status === 'approved' && styles.documentStatusApproved,
                        doc.status === 'rejected' && styles.documentStatusRejected,
                      ]}
                    >
                      {getDocumentStatusText(doc.status)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Actions based on status */}
        {provider.status === 'pending' && (
          <View style={styles.actionCard}>
            <Text style={styles.actionIcon}>💡</Text>
            <Text style={styles.actionTitle}>¿Qué sigue?</Text>
            <Text style={styles.actionDescription}>
              {documents.length === 0
                ? 'Sube tus documentos de verificación para que podamos revisar tu cuenta.'
                : 'Hemos recibido tus documentos. Te notificaremos cuando tu cuenta sea aprobada.'}
            </Text>
            {documents.length === 0 && onUploadDocuments && (
              <Button
                title="Subir documentos"
                onPress={onUploadDocuments}
                fullWidth
                style={styles.actionButton}
              />
            )}
          </View>
        )}

        {provider.status === 'rejected' && (
          <View style={[styles.actionCard, styles.actionCardRejected]}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionTitle}>¿Necesitas ayuda?</Text>
            <Text style={styles.actionDescription}>
              Si crees que hubo un error en la revisión, puedes contactarnos o
              volver a subir tus documentos.
            </Text>
            <View style={styles.actionButtons}>
              {onUploadDocuments && (
                <Button
                  title="Resubir documentos"
                  onPress={onUploadDocuments}
                  variant="outline"
                  style={styles.actionButtonHalf}
                />
              )}
              <Button
                title="Contactar soporte"
                onPress={handleContactSupport}
                style={styles.actionButtonHalf}
              />
            </View>
          </View>
        )}

        {provider.status === 'approved' && (
          <View style={[styles.actionCard, styles.actionCardApproved]}>
            <Text style={styles.actionIcon}>🎉</Text>
            <Text style={styles.actionTitle}>¡Estás listo!</Text>
            <Text style={styles.actionDescription}>
              Tu cuenta ha sido verificada. Ya puedes crear tours y empezar a
              recibir reservas.
            </Text>
            <Button
              title="Crear mi primer tour"
              onPress={() => {}}
              fullWidth
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Help */}
        <TouchableOpacity style={styles.helpButton} onPress={handleContactSupport}>
          <Text style={styles.helpIcon}>💬</Text>
          <Text style={styles.helpText}>¿Tienes preguntas? Contáctanos</Text>
        </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  statusCard: {
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  statusLabel: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  statusDescription: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
  },
  rejectionReason: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
    width: '100%',
  },
  rejectionTitle: {
    ...Typography.label,
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  rejectionText: {
    ...Typography.body,
    color: Colors.text,
  },
  providerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  providerAvatarText: {
    fontSize: 24,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    ...Typography.h3,
    color: Colors.text,
  },
  providerType: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  editButton: {
    padding: Spacing.sm,
  },
  editButtonText: {
    fontSize: 18,
  },
  providerDetails: {
    gap: Spacing.xs,
  },
  providerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerDetailIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
    width: 20,
  },
  providerDetailText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  sectionAction: {
    ...Typography.label,
    color: Colors.primary,
  },
  timeline: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: Colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: Colors.primary,
  },
  timelineCheck: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  timelinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textInverse,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
    minHeight: 24,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  timelineTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  timelineTitleCompleted: {
    color: Colors.success,
  },
  timelineTitleCurrent: {
    color: Colors.primary,
    fontWeight: '700',
  },
  timelineDescription: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  noDocuments: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noDocumentsIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  noDocumentsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  uploadButton: {
    marginTop: Spacing.sm,
  },
  documentsList: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  documentIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...Typography.label,
    color: Colors.text,
  },
  documentStatus: {
    ...Typography.caption,
    color: Colors.warning,
  },
  documentStatusApproved: {
    color: Colors.success,
  },
  documentStatusRejected: {
    color: Colors.error,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionCardRejected: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
  },
  actionCardApproved: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  actionIcon: {
    fontSize: 32,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  actionDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButtonHalf: {
    flex: 1,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  helpIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  helpText: {
    ...Typography.label,
    color: Colors.primary,
  },
});
