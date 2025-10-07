// Système de gestion des documents confidentiels
class DocumentManager {
    constructor() {
        this.encryptionKey = this.getOrCreateEncryptionKey();
    }

    // Générer ou récupérer une clé de chiffrement unique
    getOrCreateEncryptionKey() {
        let key = localStorage.getItem('docEncryptionKey');
        if (!key) {
            key = this.generateRandomKey();
            localStorage.setItem('docEncryptionKey', key);
        }
        return key;
    }

    generateRandomKey() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)), 
            byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Chiffrement simple (pour la démo - en production, utiliser crypto-js ou similaire)
    encrypt(data) {
        try {
            const jsonString = JSON.stringify(data);
            const encrypted = btoa(jsonString); // Base64 simple pour la démo
            return encrypted;
        } catch (error) {
            console.error('Erreur de chiffrement:', error);
            return data;
        }
    }

    decrypt(encryptedData) {
        try {
            const decrypted = atob(encryptedData);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Erreur de déchiffrement:', error);
            return null;
        }
    }

    // Sauvegarder un document de manière sécurisée
    saveSecureDocument(document) {
        const documents = this.getSecureDocuments();
        const encryptedDoc = {
            id: document.id || this.generateDocumentId(),
            timestamp: new Date().toISOString(),
            doctorId: this.getCurrentDoctorId(),
            encrypted: this.encrypt(document),
            metadata: {
                type: document.type,
                patientEmail: document.patientEmail || '',
                createdAt: new Date().toISOString()
            }
        };
        
        documents.push(encryptedDoc);
        localStorage.setItem('secureDocuments', JSON.stringify(documents));
        return encryptedDoc.id;
    }

    // Récupérer les documents sécurisés
    getSecureDocuments() {
        const docs = localStorage.getItem('secureDocuments');
        return docs ? JSON.parse(docs) : [];
    }

    // Récupérer un document spécifique
    getDocument(documentId) {
        const documents = this.getSecureDocuments();
        const doc = documents.find(d => d.id === documentId);
        
        if (!doc) return null;
        
        // Vérifier l'accès (seul le médecin qui a créé le document peut y accéder)
        if (doc.doctorId !== this.getCurrentDoctorId()) {
            console.warn('Accès refusé au document:', documentId);
            return null;
        }
        
        const decrypted = this.decrypt(doc.encrypted);
        return decrypted ? { ...decrypted, id: doc.id, metadata: doc.metadata } : null;
    }

    // Supprimer un document
    deleteDocument(documentId) {
        const documents = this.getSecureDocuments();
        const filteredDocs = documents.filter(d => 
            d.id !== documentId || d.doctorId !== this.getCurrentDoctorId()
        );
        localStorage.setItem('secureDocuments', JSON.stringify(filteredDocs));
    }

    // Obtenir l'ID du médecin actuel
    getCurrentDoctorId() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.id || 'anonymous';
    }

    generateDocumentId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Nettoyer les documents expirés
    cleanupExpiredDocuments() {
        const documents = this.getSecureDocuments();
        const now = new Date();
        
        const validDocs = documents.filter(doc => {
            if (doc.metadata && doc.metadata.expiresAt) {
                return new Date(doc.metadata.expiresAt) > now;
            }
            return true; // Garder les documents sans expiration
        });
        
        localStorage.setItem('secureDocuments', JSON.stringify(validDocs));
    }
}

// Gestionnaire de signatures
class SignatureManager {
    constructor() {
        this.documentManager = new DocumentManager();
    }

    // Vérifier les nouvelles signatures
    checkForNewSignatures() {
        const sharedDocuments = JSON.parse(localStorage.getItem('sharedDocuments') || '[]');
        const doctorId = this.documentManager.getCurrentDoctorId();
        
        return sharedDocuments.filter(doc => 
            doc.signed && 
            doc.doctorId === doctorId && 
            !doc.notificationSent
        );
    }

    // Marquer une signature comme notifiée
    markSignatureAsNotified(documentId) {
        let sharedDocuments = JSON.parse(localStorage.getItem('sharedDocuments') || '[]');
        const docIndex = sharedDocuments.findIndex(doc => doc.id === documentId);
        
        if (docIndex >= 0) {
            sharedDocuments[docIndex].notificationSent = true;
            localStorage.setItem('sharedDocuments', JSON.stringify(sharedDocuments));
        }
    }

    // Obtenir les statistiques de signatures
    getSignatureStats() {
        const sharedDocuments = JSON.parse(localStorage.getItem('sharedDocuments') || '[]');
        const doctorId = this.documentManager.getCurrentDoctorId();
        
        const myDocs = sharedDocuments.filter(doc => doc.doctorId === doctorId);
        
        return {
            total: myDocs.length,
            signed: myDocs.filter(doc => doc.signed).length,
            pending: myDocs.filter(doc => !doc.signed && new Date(doc.expiresAt) > new Date()).length,
            expired: myDocs.filter(doc => !doc.signed && new Date(doc.expiresAt) <= new Date()).length
        };
    }
}

// Gestionnaire de notifications
class NotificationManager {
    constructor() {
        this.signatureManager = new SignatureManager();
        this.checkInterval = null;
    }

    // Démarrer la surveillance des notifications
    startWatching() {
        this.checkInterval = setInterval(() => {
            this.checkForNotifications();
        }, 30000); // Vérifier toutes les 30 secondes
    }

    // Arrêter la surveillance
    stopWatching() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Vérifier les notifications
    checkForNotifications() {
        const newSignatures = this.signatureManager.checkForNewSignatures();
        
        newSignatures.forEach(doc => {
            this.showNotification(doc);
            this.signatureManager.markSignatureAsNotified(doc.id);
        });
    }

    // Afficher une notification
    showNotification(document) {
        // Notification du navigateur (si autorisée)
        if (Notification.permission === 'granted') {
            new Notification('Document signé', {
                body: `Le document ${document.type} a été signé par ${document.patientEmail}`,
                icon: '/favicon.ico'
            });
        }

        // Notification dans l'interface
        this.showInPageNotification(document);
    }

    // Notification dans la page
    showInPageNotification(document) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <strong>✅ Document signé</strong><br>
                Le document ${document.type} a été signé par ${document.patientEmail}
                <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer;">×</button>
            </div>
        `;
        
        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Demander la permission pour les notifications
    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Utilitaires pour l'audit et la sécurité
class AuditLogger {
    static log(action, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            doctorId: new DocumentManager().getCurrentDoctorId(),
            details: details,
            userAgent: navigator.userAgent,
            ip: 'localhost' // En production, obtenir la vraie IP
        };

        const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        logs.push(logEntry);
        
        // Garder seulement les 1000 derniers logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('auditLogs', JSON.stringify(logs));
        console.log('Audit Log:', logEntry);
    }

    static getLogs(limit = 100) {
        const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        return logs.slice(-limit).reverse(); // Les plus récents en premier
    }
}

// Validation et sécurité des formulaires
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    }

    static validateDocumentData(data, type) {
        const errors = [];

        switch (type) {
            case 'arret_travail':
                if (!data.patient_nom) errors.push('Nom du patient requis');
                if (!data.patient_prenom) errors.push('Prénom du patient requis');
                if (!data.medecin_nom) errors.push('Nom du médecin requis');
                if (!data.arret_debut || !data.arret_fin) errors.push('Dates d\'arrêt requises');
                break;

            case 'certificat_naissance':
                if (!data.enfant_nom) errors.push('Nom de l\'enfant requis');
                if (!data.enfant_naissance) errors.push('Date de naissance requise');
                if (!data.mere_nom) errors.push('Nom de la mère requis');
                break;

            case 'facture_hospitalisation':
                if (!data.facture_patient) errors.push('Nom du patient requis');
                if (!data.facture_medecin) errors.push('Nom du médecin requis');
                if (!data.total_general) errors.push('Total de la facture requis');
                break;
        }

        return errors;
    }
}

// Système de sauvegarde et restauration
class BackupManager {
    static createBackup() {
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            userData: localStorage.getItem('userData'),
            savedDocuments: localStorage.getItem('savedDocuments'),
            sharedDocuments: localStorage.getItem('sharedDocuments'),
            secureDocuments: localStorage.getItem('secureDocuments'),
            auditLogs: localStorage.getItem('auditLogs')
        };

        const backupData = JSON.stringify(backup, null, 2);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `aidesams_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        AuditLogger.log('BACKUP_CREATED', { size: backupData.length });
    }

    static restoreBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Vérifier la validité de la sauvegarde
                    if (!backup.version || !backup.timestamp) {
                        throw new Error('Format de sauvegarde invalide');
                    }
                    
                    // Restaurer les données
                    if (backup.userData) localStorage.setItem('userData', backup.userData);
                    if (backup.savedDocuments) localStorage.setItem('savedDocuments', backup.savedDocuments);
                    if (backup.sharedDocuments) localStorage.setItem('sharedDocuments', backup.sharedDocuments);
                    if (backup.secureDocuments) localStorage.setItem('secureDocuments', backup.secureDocuments);
                    if (backup.auditLogs) localStorage.setItem('auditLogs', backup.auditLogs);
                    
                    AuditLogger.log('BACKUP_RESTORED', { 
                        backupDate: backup.timestamp,
                        version: backup.version 
                    });
                    
                    resolve(backup);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// Export des classes pour utilisation globale
window.DocumentManager = DocumentManager;
window.SignatureManager = SignatureManager;
window.NotificationManager = NotificationManager;
window.AuditLogger = AuditLogger;
window.FormValidator = FormValidator;
window.BackupManager = BackupManager;

// Initialisation globale
document.addEventListener('DOMContentLoaded', function() {
    // Démarrer le gestionnaire de notifications
    if (typeof window.notificationManager === 'undefined') {
        window.notificationManager = new NotificationManager();
        window.notificationManager.requestPermission();
        window.notificationManager.startWatching();
    }
    
    // Nettoyer les documents expirés au démarrage
    const docManager = new DocumentManager();
    docManager.cleanupExpiredDocuments();
});

// Nettoyage à la fermeture de la page
window.addEventListener('beforeunload', function() {
    if (window.notificationManager) {
        window.notificationManager.stopWatching();
    }
});
