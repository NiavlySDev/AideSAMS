// Document sharing and signature management system
class DocumentSharingSystem {
    constructor() {
        this.sharedDocuments = new Map();
        this.signedDocuments = new Map();
    }

    shareDocumentWithParents(password = null) {
        const element = document.querySelector('.document-template');
        if (!element) {
            showNotification('Aucun document à partager', 'error');
            return null;
        }

        // Generate unique share ID
        const shareId = this.generateShareId();
        
        // Generate random password if not provided
        if (!password) {
            password = this.generatePassword();
        }

        // Store document data for sharing
        const documentData = {
            html: element.outerHTML,
            type: documentManager.currentDocumentType || 'unknown',
            createdAt: new Date().toISOString(),
            password: password,
            signatures: {
                mother: null,
                father: null
            },
            status: 'pending'
        };

        // Store in localStorage (in real app, this would be server-side)
        localStorage.setItem(`shared_document_${shareId}`, JSON.stringify(documentData));
        this.sharedDocuments.set(shareId, documentData);

        // Generate shareable link
        const shareLink = `${window.location.origin}${window.location.pathname.replace('index.html', '')}parent-signature.html?id=${shareId}`;

        return {
            shareId,
            password,
            shareLink,
            qrCode: this.generateQRCodeData(shareLink)
        };
    }

    generateShareId() {
        return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    generateQRCodeData(url) {
        // This would normally use a QR code library
        return `QR Code for: ${url}`;
    }

    checkSignatureStatus(shareId) {
        const documentData = JSON.parse(localStorage.getItem(`shared_document_${shareId}`) || 'null');
        if (!documentData) return null;

        return {
            motherSigned: !!documentData.signatures.mother,
            fatherSigned: !!documentData.signatures.father,
            allSigned: !!(documentData.signatures.mother && documentData.signatures.father),
            status: documentData.status
        };
    }

    getSignedDocument(shareId) {
        const documentData = JSON.parse(localStorage.getItem(`shared_document_${shareId}`) || 'null');
        if (!documentData) return null;

        if (!documentData.signatures.mother || !documentData.signatures.father) {
            return null; // Not fully signed
        }

        // Create signed version with signatures
        const signedDoc = this.createSignedDocument(documentData);
        return signedDoc;
    }

    createSignedDocument(documentData) {
        const element = document.createElement('div');
        element.innerHTML = documentData.html;

        // Add signatures to the document
        const signaturesSection = document.createElement('div');
        signaturesSection.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            border-top: 2px solid #22c55e;
            page-break-inside: avoid;
        `;

        signaturesSection.innerHTML = `
            <h3 style="color: #22c55e; margin-bottom: 20px;">✅ Signatures des Parents</h3>
            <div style="display: flex; justify-content: space-between; gap: 40px;">
                <div style="flex: 1;">
                    <h4>Signature de la Mère</h4>
                    <img src="${documentData.signatures.mother.dataURL}" 
                         style="max-width: 200px; height: 75px; border: 1px solid #ddd; margin: 10px 0;" 
                         alt="Signature Mère">
                    <p style="font-size: 12px; color: #666;">
                        Signée le ${new Date(documentData.signatures.mother.timestamp).toLocaleString('fr-FR')}
                    </p>
                </div>
                <div style="flex: 1;">
                    <h4>Signature du Père</h4>
                    <img src="${documentData.signatures.father.dataURL}" 
                         style="max-width: 200px; height: 75px; border: 1px solid #ddd; margin: 10px 0;" 
                         alt="Signature Père">
                    <p style="font-size: 12px; color: #666;">
                        Signée le ${new Date(documentData.signatures.father.timestamp).toLocaleString('fr-FR')}
                    </p>
                </div>
            </div>
        `;

        element.appendChild(signaturesSection);
        return element.outerHTML;
    }

    loadSignedDocumentForEditing(shareId) {
        const signedDocumentHtml = this.getSignedDocument(shareId);
        if (!signedDocumentHtml) {
            showNotification('Document non trouvé ou pas encore entièrement signé', 'error');
            return false;
        }

        // Load the signed document into the current editor
        const container = document.querySelector('#documentContainer');
        if (container) {
            container.innerHTML = signedDocumentHtml;
            showNotification('Document signé chargé avec succès', 'success');
            return true;
        }
        
        return false;
    }
}

// Global sharing system instance
let sharingSystem = new DocumentSharingSystem();

// Global functions for sharing
function shareWithParents() {
    const shareData = sharingSystem.shareDocumentWithParents();
    if (!shareData) return;

    // Show sharing modal/dialog
    showSharingDialog(shareData);
}

function showSharingDialog(shareData) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
            <h2 style="color: #22c55e; margin-bottom: 20px;">📤 Partager avec les Parents</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold;">Lien de signature:</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <input type="text" value="${shareData.shareLink}" 
                           id="shareLink" readonly 
                           style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <button onclick="copyToClipboard('shareLink')" 
                            style="padding: 10px 15px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Copier
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="font-weight: bold;">Mot de passe d'accès:</label>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <input type="text" value="${shareData.password}" 
                           id="sharePassword" readonly 
                           style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; font-weight: bold;">
                    <button onclick="copyToClipboard('sharePassword')" 
                            style="padding: 10px 15px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Copier
                    </button>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #0369a1;">
                    💡 <strong>Instructions:</strong><br>
                    1. Envoyez le lien aux parents<br>
                    2. Communiquez-leur le mot de passe séparément<br>
                    3. Les deux parents doivent signer le document<br>
                    4. Vous recevrez une notification une fois terminé
                </p>
            </div>
            
            <div style="text-align: right;">
                <button onclick="closeModal()" 
                        style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    Fermer
                </button>
                <button onclick="checkSignatures('${shareData.shareId}')" 
                        style="padding: 10px 20px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Vérifier les signatures
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.currentModal = modal;
}

function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    document.execCommand('copy');
    showNotification('Copié dans le presse-papiers!', 'success');
}

function closeModal() {
    if (window.currentModal) {
        document.body.removeChild(window.currentModal);
        window.currentModal = null;
    }
}

function checkSignatures(shareId) {
    const status = sharingSystem.checkSignatureStatus(shareId);
    if (!status) {
        showNotification('Document non trouvé', 'error');
        return;
    }

    if (status.allSigned) {
        showNotification('✅ Toutes les signatures ont été recueillies!', 'success');
        closeModal();
        
        // Ask if doctor wants to load the signed document
        setTimeout(() => {
            const loadSigned = confirm('Voulez-vous charger le document signé pour éditer ou exporter?');
            if (loadSigned) {
                loadSignedDocument(shareId);
            }
        }, 1000);
    } else {
        const motherStatus = status.motherSigned ? '✅' : '⏳';
        const fatherStatus = status.fatherSigned ? '✅' : '⏳';
        showNotification(`Statut: Mère ${motherStatus} | Père ${fatherStatus}`, 'info');
    }
}

function loadSignedDocument(shareId) {
    const success = sharingSystem.loadSignedDocumentForEditing(shareId);
    if (success) {
        // Update UI to show this is a signed document
        const header = document.querySelector('.document-header');
        if (header) {
            const signedBadge = document.createElement('div');
            signedBadge.style.cssText = `
                background: #22c55e;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 15px;
                display: inline-block;
            `;
            signedBadge.textContent = '✅ DOCUMENT SIGNÉ';
            header.appendChild(signedBadge);
        }
    }
}

function openSignedDocumentsManager() {
    // Get all signed documents from localStorage
    const signedDocuments = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('shared_document_')) {
            const docData = JSON.parse(localStorage.getItem(key));
            if (docData && docData.signatures && docData.signatures.mother && docData.signatures.father) {
                signedDocuments.push({
                    shareId: key.replace('shared_document_', ''),
                    ...docData
                });
            }
        }
    }

    // Show modal with signed documents list
    showSignedDocumentsModal(signedDocuments);
}

function showSignedDocumentsModal(signedDocuments) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    let documentsHtml = '';
    if (signedDocuments.length === 0) {
        documentsHtml = '<p style="text-align: center; color: #666; padding: 20px;">Aucun document signé trouvé.</p>';
    } else {
        signedDocuments.forEach(doc => {
            const createdDate = new Date(doc.createdAt).toLocaleString('fr-FR');
            const motherSigned = new Date(doc.signatures.mother.timestamp).toLocaleString('fr-FR');
            const fatherSigned = new Date(doc.signatures.father.timestamp).toLocaleString('fr-FR');
            
            documentsHtml += `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #22c55e;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">${doc.type || 'Document'}</h4>
                    <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
                        <p style="margin: 2px 0;">📅 Créé le: ${createdDate}</p>
                        <p style="margin: 2px 0;">👩 Mère signée le: ${motherSigned}</p>
                        <p style="margin: 2px 0;">👨 Père signé le: ${fatherSigned}</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="loadSignedDocument('${doc.shareId}'); closeModal();" 
                                style="padding: 8px 15px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            📂 Charger
                        </button>
                        <button onclick="exportSignedDocument('${doc.shareId}')" 
                                style="padding: 8px 15px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            📄 Export PDF
                        </button>
                        <button onclick="deleteSignedDocument('${doc.shareId}')" 
                                style="padding: 8px 15px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `;
        });
    }

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h2 style="color: #22c55e; margin-bottom: 20px;">📋 Documents Signés</h2>
            
            <div style="margin-bottom: 20px;">
                ${documentsHtml}
            </div>
            
            <div style="text-align: right;">
                <button onclick="closeModal()" 
                        style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Fermer
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.currentModal = modal;
}

function exportSignedDocument(shareId) {
    // Load the signed document temporarily
    const signedDocumentHtml = sharingSystem.getSignedDocument(shareId);
    if (!signedDocumentHtml) {
        showNotification('Document non trouvé', 'error');
        return;
    }

    // Create temporary container for export
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = signedDocumentHtml;
    tempContainer.className = 'document-template';
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    // Use the existing export function
    if (typeof exportManager !== 'undefined' && exportManager.exportPDF) {
        exportManager.exportPDF();
    } else {
        showNotification('Fonction d\'export non disponible', 'error');
    }

    // Clean up
    document.body.removeChild(tempContainer);
}

function deleteSignedDocument(shareId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document signé? Cette action est irréversible.')) {
        localStorage.removeItem(`shared_document_${shareId}`);
        localStorage.removeItem(`share_completed_${shareId}`);
        showNotification('Document supprimé avec succès', 'success');
        
        // Refresh the modal
        setTimeout(() => {
            closeModal();
            openSignedDocumentsManager();
        }, 1000);
    }
}
