// Main documents management system
class DocumentManager {
    constructor() {
        this.currentDocument = null;
        this.currentDocumentType = null;
        this.documentData = {};
        this.signatures = {};
        this.init();
    }

    init() {
        this.loadSavedDocuments();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('.form-field input, .form-field textarea, .form-field select')) {
                this.autoSave();
            }
        });
    }

    loadSavedDocuments() {
        const saved = localStorage.getItem('sams_documents');
        if (saved) {
            this.documentData = JSON.parse(saved);
        }
    }

    saveDocuments() {
        localStorage.setItem('sams_documents', JSON.stringify(this.documentData));
    }

    autoSave() {
        if (this.currentDocumentType) {
            this.collectFormData();
            this.saveDocuments();
        }
    }

    collectFormData() {
        const formData = {};
        const inputs = document.querySelectorAll('.form-field input, .form-field textarea, .form-field select');
        
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });

        if (!this.documentData[this.currentDocumentType]) {
            this.documentData[this.currentDocumentType] = {};
        }
        
        this.documentData[this.currentDocumentType] = {
            ...this.documentData[this.currentDocumentType],
            formData: formData,
            lastModified: new Date().toISOString()
        };
    }

    populateForm(data) {
        if (!data || !data.formData) return;

        Object.keys(data.formData).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data.formData[key] || '';
            }
        });
    }

    clearCurrentDocument() {
        const inputs = document.querySelectorAll('.form-field input, .form-field textarea, .form-field select');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // Clear signatures
        const signatureContents = document.querySelectorAll('.signature-content');
        signatureContents.forEach(content => {
            content.innerHTML = '';
        });
    }

    generateDocumentId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Global document manager instance
let documentManager = new DocumentManager();

// Document type change handler
function changeDocumentType() {
    const select = document.getElementById('documentType');
    const editor = document.getElementById('document-editor');
    const content = document.getElementById('document-content');
    const shareBtn = document.querySelector('.share-btn');
    
    if (!select.value) {
        editor.classList.add('hidden');
        return;
    }

    documentManager.currentDocumentType = select.value;
    editor.classList.remove('hidden');

    // Show/hide share button only for birth certificate
    if (select.value === 'certificat-naissance') {
        shareBtn.classList.remove('hidden');
    } else {
        shareBtn.classList.add('hidden');
    }

    // Load the appropriate template
    loadDocumentTemplate(select.value);
}

function loadDocumentTemplate(type) {
    const content = document.getElementById('document-content');
    let template = '';

    switch (type) {
        case 'arret-travail':
            template = getArretTravailTemplate();
            break;
        case 'certificat-naissance':
            template = getCertificatNaissanceTemplate();
            break;
        case 'facture-hospitalisation':
            template = getFactureHospitalisationTemplate();
            break;
    }

    content.innerHTML = template;

    // Load saved data if exists
    const savedData = documentManager.documentData[type];
    if (savedData) {
        documentManager.populateForm(savedData);
    }
}

// Document actions
function saveDocument() {
    if (!documentManager.currentDocumentType) {
        alert('Aucun document sélectionné');
        return;
    }

    documentManager.collectFormData();
    documentManager.saveDocuments();
    
    showNotification('Document sauvegardé avec succès', 'success');
}

function loadDocument() {
    if (!documentManager.currentDocumentType) {
        alert('Sélectionnez un type de document d\'abord');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                documentManager.documentData[documentManager.currentDocumentType] = data;
                documentManager.populateForm(data);
                showNotification('Document chargé avec succès', 'success');
            } catch (error) {
                showNotification('Erreur lors du chargement du document', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function clearDocument() {
    if (confirm('Êtes-vous sûr de vouloir effacer ce document ?')) {
        documentManager.clearCurrentDocument();
        showNotification('Document effacé', 'info');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getCurrentDateTime() {
    const now = new Date();
    return {
        date: now.toLocaleDateString('fr-FR'),
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document manager initialized');
});