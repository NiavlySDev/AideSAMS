// Signature management system
class SignatureManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentSignatureTarget = null;
        this.savedSignatures = this.loadSavedSignatures();
    }

    loadSavedSignatures() {
        const saved = localStorage.getItem('sams_signatures');
        return saved ? JSON.parse(saved) : [];
    }

    saveSignaturesToStorage() {
        localStorage.setItem('sams_signatures', JSON.stringify(this.savedSignatures));
    }

    initCanvas() {
        this.canvas = document.getElementById('signatureCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set up canvas for drawing
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }

    clearSignature() {
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    getSignatureDataURL() {
        return this.canvas.toDataURL('image/png');
    }

    saveSignatureToProfile() {
        if (!this.canvas) return;
        
        const dataURL = this.getSignatureDataURL();
        const name = prompt('Nom pour cette signature:');
        
        if (name && dataURL) {
            const signature = {
                id: Date.now(),
                name: name,
                dataURL: dataURL,
                type: 'drawn',
                created: new Date().toISOString()
            };
            
            this.savedSignatures.push(signature);
            this.saveSignaturesToStorage();
            this.displaySavedSignatures();
            showNotification('Signature sauvegardée', 'success');
        }
    }

    displaySavedSignatures() {
        const container = document.getElementById('savedSignaturesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.savedSignatures.forEach(signature => {
            const item = document.createElement('div');
            item.className = 'saved-signature-item';
            item.dataset.signatureId = signature.id;
            
            const preview = document.createElement('div');
            preview.className = 'saved-signature-preview';
            
            if (signature.type === 'drawn') {
                const img = document.createElement('img');
                img.src = signature.dataURL;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                preview.appendChild(img);
            } else if (signature.type === 'typed') {
                preview.innerHTML = `<span style="font-family: ${signature.font}; font-size: 18px;">${signature.text}</span>`;
            }
            
            const name = document.createElement('div');
            name.textContent = signature.name;
            name.style.fontSize = '12px';
            name.style.color = '#aaa';
            
            item.appendChild(preview);
            item.appendChild(name);
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.saved-signature-item').forEach(el => 
                    el.classList.remove('selected'));
                item.classList.add('selected');
            });
            
            container.appendChild(item);
        });
    }

    createTypedSignature() {
        const text = document.getElementById('typedSignature').value;
        const font = document.getElementById('signatureFont').value;
        
        if (!text) return null;
        
        // Create a temporary canvas to generate the signature image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000';
        ctx.font = `30px "${font}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        return {
            dataURL: canvas.toDataURL('image/png'),
            text: text,
            font: font,
            type: 'typed'
        };
    }

    updateTypedSignaturePreview() {
        const text = document.getElementById('typedSignature').value;
        const font = document.getElementById('signatureFont').value;
        
        let preview = document.querySelector('.signature-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'signature-preview';
            document.getElementById('typeSignature').appendChild(preview);
        }
        
        preview.innerHTML = `<span style="font-family: '${font}', cursive;">${text}</span>`;
    }
}

// Global signature manager instance
let signatureManager = new SignatureManager();

// Signature modal functions
function openSignatureModal() {
    const modal = document.getElementById('signatureModal');
    modal.style.display = 'block';
    
    // Reset to draw mode by default
    showDrawSignature();
}

function closeSignatureModal() {
    const modal = document.getElementById('signatureModal');
    modal.style.display = 'none';
    
    // Clear any temporary signature data
    if (signatureManager.canvas) {
        signatureManager.clearSignature();
    }
}

function showDrawSignature() {
    hideAllSignatureMethods();
    document.getElementById('drawSignature').classList.remove('hidden');
    
    // Initialize canvas if not already done
    setTimeout(() => {
        signatureManager.initCanvas();
    }, 100);
}

function showSavedSignatures() {
    hideAllSignatureMethods();
    document.getElementById('savedSignatures').classList.remove('hidden');
    signatureManager.displaySavedSignatures();
}

function showTypeSignature() {
    hideAllSignatureMethods();
    document.getElementById('typeSignature').classList.remove('hidden');
    
    // Set up event listeners for typed signature
    const textInput = document.getElementById('typedSignature');
    const fontSelect = document.getElementById('signatureFont');
    
    textInput.addEventListener('input', () => signatureManager.updateTypedSignaturePreview());
    fontSelect.addEventListener('change', () => signatureManager.updateTypedSignaturePreview());
    
    // Initial preview
    signatureManager.updateTypedSignaturePreview();
}

function hideAllSignatureMethods() {
    document.querySelectorAll('.signature-method').forEach(method => {
        method.classList.add('hidden');
    });
}

function clearSignature() {
    signatureManager.clearSignature();
}

function saveSignatureToProfile() {
    signatureManager.saveSignatureToProfile();
}

function applySignature() {
    let signatureData = null;
    
    // Check which signature method is active
    const drawSection = document.getElementById('drawSignature');
    const savedSection = document.getElementById('savedSignatures');
    const typeSection = document.getElementById('typeSignature');
    
    if (!drawSection.classList.contains('hidden')) {
        // Draw signature
        signatureData = {
            dataURL: signatureManager.getSignatureDataURL(),
            type: 'drawn'
        };
    } else if (!savedSection.classList.contains('hidden')) {
        // Saved signature
        const selected = document.querySelector('.saved-signature-item.selected');
        if (selected) {
            const signatureId = selected.dataset.signatureId;
            const signature = signatureManager.savedSignatures.find(s => s.id == signatureId);
            if (signature) {
                signatureData = signature;
            }
        }
    } else if (!typeSection.classList.contains('hidden')) {
        // Typed signature
        signatureData = signatureManager.createTypedSignature();
    }
    
    if (signatureData) {
        insertSignatureIntoDocument(signatureData);
        closeSignatureModal();
        showNotification('Signature appliquée', 'success');
    } else {
        alert('Veuillez créer ou sélectionner une signature');
    }
}

function insertSignatureIntoDocument(signatureData) {
    // Look for signature containers in the document
    const signatureContents = document.querySelectorAll('.signature-content');
    
    if (signatureContents.length === 0) {
        alert('Aucune zone de signature trouvée dans ce document');
        return;
    }
    
    // For now, insert into the first available signature area
    // In a more advanced version, we could let the user choose which signature area
    let targetSignature = null;
    
    for (let content of signatureContents) {
        if (!content.innerHTML.trim()) {
            targetSignature = content;
            break;
        }
    }
    
    if (!targetSignature) {
        targetSignature = signatureContents[0]; // Replace existing signature
    }
    
    // Insert the signature
    if (signatureData.type === 'drawn' || signatureData.dataURL) {
        const img = document.createElement('img');
        img.src = signatureData.dataURL;
        img.style.maxWidth = '150px';
        img.style.maxHeight = '50px';
        targetSignature.innerHTML = '';
        targetSignature.appendChild(img);
    } else if (signatureData.type === 'typed') {
        targetSignature.innerHTML = `<span style="font-family: '${signatureData.font}', cursive; font-size: 18px;">${signatureData.text}</span>`;
    }
}

// Click outside modal to close
window.onclick = function(event) {
    const signatureModal = document.getElementById('signatureModal');
    const shareModal = document.getElementById('shareModal');
    
    if (event.target === signatureModal) {
        closeSignatureModal();
    }
    if (event.target === shareModal) {
        closeShareModal();
    }
};