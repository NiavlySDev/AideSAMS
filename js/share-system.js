// Secure sharing system for parent signatures
class ShareManager {
    constructor() {
        this.shareData = this.loadShareData();
        this.baseURL = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    }

    loadShareData() {
        const saved = localStorage.getItem('sams_shared_documents');
        return saved ? JSON.parse(saved) : {};
    }

    saveShareData() {
        localStorage.setItem('sams_shared_documents', JSON.stringify(this.shareData));
    }

    generatePassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    generateShareId() {
        return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    createSharedDocument() {
        if (documentManager.currentDocumentType !== 'certificat-naissance') {
            showNotification('Le partage n\'est disponible que pour les certificats de naissance', 'error');
            return null;
        }

        // Collect current document data
        documentManager.collectFormData();
        const documentData = documentManager.documentData[documentManager.currentDocumentType];
        
        if (!documentData || !documentData.formData) {
            showNotification('Veuillez remplir le document avant de le partager', 'error');
            return null;
        }

        const shareId = this.generateShareId();
        const password = this.generatePassword();
        
        const sharedDoc = {
            id: shareId,
            password: password,
            documentType: 'certificat-naissance',
            documentData: documentData,
            created: new Date().toISOString(),
            signatures: {
                mother: null,
                father: null
            },
            status: 'pending' // pending, completed
        };

        this.shareData[shareId] = sharedDoc;
        this.saveShareData();

        return {
            shareId: shareId,
            password: password,
            url: `${this.baseURL}/parent-signature.html?id=${shareId}`
        };
    }

    getSharedDocument(shareId) {
        return this.shareData[shareId] || null;
    }

    updateSignature(shareId, parentType, signatureData) {
        const sharedDoc = this.shareData[shareId];
        if (!sharedDoc) return false;

        sharedDoc.signatures[parentType] = {
            data: signatureData,
            timestamp: new Date().toISOString()
        };

        // Check if both parents have signed
        if (sharedDoc.signatures.mother && sharedDoc.signatures.father) {
            sharedDoc.status = 'completed';
        }

        this.saveShareData();
        return true;
    }

    checkForCompletedSignatures() {
        // Check if any shared documents have been completed
        Object.keys(this.shareData).forEach(shareId => {
            const sharedDoc = this.shareData[shareId];
            if (sharedDoc.status === 'completed' && sharedDoc.documentType === 'certificat-naissance') {
                // Update the local document with parent signatures
                this.updateLocalDocumentWithSignatures(sharedDoc);
            }
        });
    }

    updateLocalDocumentWithSignatures(sharedDoc) {
        if (documentManager.currentDocumentType === 'certificat-naissance') {
            // Update the signature area with parent signatures
            const parentSignatureArea = document.getElementById('parents-signature');
            if (parentSignatureArea && sharedDoc.signatures.mother && sharedDoc.signatures.father) {
                const signaturesContainer = document.createElement('div');
                signaturesContainer.style.display = 'flex';
                signaturesContainer.style.flexDirection = 'column';
                signaturesContainer.style.gap = '10px';
                
                // Mother signature
                const motherDiv = document.createElement('div');
                motherDiv.innerHTML = '<small>Mère:</small>';
                const motherImg = document.createElement('img');
                motherImg.src = sharedDoc.signatures.mother.data.dataURL;
                motherImg.style.maxWidth = '100px';
                motherImg.style.maxHeight = '30px';
                motherDiv.appendChild(motherImg);
                
                // Father signature
                const fatherDiv = document.createElement('div');
                fatherDiv.innerHTML = '<small>Père:</small>';
                const fatherImg = document.createElement('img');
                fatherImg.src = sharedDoc.signatures.father.data.dataURL;
                fatherImg.style.maxWidth = '100px';
                fatherImg.style.maxHeight = '30px';
                fatherDiv.appendChild(fatherImg);
                
                signaturesContainer.appendChild(motherDiv);
                signaturesContainer.appendChild(fatherDiv);
                
                parentSignatureArea.innerHTML = '';
                parentSignatureArea.appendChild(signaturesContainer);
                
                showNotification('Signatures des parents mises à jour', 'success');
            }
        }
    }
}

// Global share manager instance
let shareManager = new ShareManager();

// Share modal functions
function shareForParentSignature() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'block';
    
    // Generate new password
    const password = shareManager.generatePassword();
    document.getElementById('generatedPassword').textContent = password;
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'none';
}

function generateShareLink() {
    const shared = shareManager.createSharedDocument();
    
    if (shared) {
        document.getElementById('shareLink').value = shared.url;
        document.getElementById('generatedPassword').textContent = shared.password;
        
        showNotification('Lien de partage généré avec succès', 'success');
        
        // Store the share info for easy access
        window.currentShareInfo = shared;
    }
}

function copyShareLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showNotification('Lien copié dans le presse-papiers', 'success');
    } catch (err) {
        showNotification('Erreur lors de la copie', 'error');
    }
}

function copyPassword() {
    const password = document.getElementById('generatedPassword').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(password).then(() => {
            showNotification('Mot de passe copié dans le presse-papiers', 'success');
        }).catch(() => {
            showNotification('Erreur lors de la copie', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = password;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('Mot de passe copié dans le presse-papiers', 'success');
        } catch (err) {
            showNotification('Erreur lors de la copie', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Check for completed signatures periodically
setInterval(() => {
    shareManager.checkForCompletedSignatures();
}, 30000); // Check every 30 seconds

// Initialize share system
document.addEventListener('DOMContentLoaded', function() {
    // Check for completed signatures on page load
    setTimeout(() => {
        shareManager.checkForCompletedSignatures();
    }, 1000);
});