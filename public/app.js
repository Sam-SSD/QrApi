// === CONFIGURACIÓN GLOBAL ===
let currentQRData = null;
let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];
let currentZoom = 1;
let uploadedLogo = null;

// === ELEMENTOS DOM ===
const elements = {
    // Inputs principales
    qrText: document.getElementById('qrText'),
    contentType: document.getElementById('contentType'),
    charCount: document.getElementById('charCount'),
    
    // Colores
    primaryColor: document.getElementById('primaryColor'),
    primaryColorHex: document.getElementById('primaryColorHex'),
    bgColor: document.getElementById('bgColor'),
    bgColorHex: document.getElementById('bgColorHex'),
    useGradient: document.getElementById('useGradient'),
    gradientOptions: document.getElementById('gradientOptions'),
    secondaryColor: document.getElementById('secondaryColor'),
    secondaryColorHex: document.getElementById('secondaryColorHex'),
    gradientAngle: document.getElementById('gradientAngle'),
    gradientAngleValue: document.getElementById('gradientAngleValue'),
    
    // Estilo
    qrSize: document.getElementById('qrSize'),
    qrSizeValue: document.getElementById('qrSizeValue'),
    qrMargin: document.getElementById('qrMargin'),
    qrMarginValue: document.getElementById('qrMarginValue'),
    errorCorrection: document.getElementById('errorCorrection'),
    dotStyle: document.getElementById('dotStyle'),
    roundedCorners: document.getElementById('roundedCorners'),
    cornerRadiusSection: document.getElementById('cornerRadiusSection'),
    cornerRadius: document.getElementById('cornerRadius'),
    cornerRadiusValue: document.getElementById('cornerRadiusValue'),
    
    // Marco
    useFrame: document.getElementById('useFrame'),
    frameOptions: document.getElementById('frameOptions'),
    frameColor: document.getElementById('frameColor'),
    frameColorHex: document.getElementById('frameColorHex'),
    frameText: document.getElementById('frameText'),
    frameWidth: document.getElementById('frameWidth'),
    frameWidthValue: document.getElementById('frameWidthValue'),
    
    // Logo
    useLogo: document.getElementById('useLogo'),
    logoOptions: document.getElementById('logoOptions'),
    logoUpload: document.getElementById('logoUpload'),
    triggerLogoUpload: document.getElementById('triggerLogoUpload'),
    logoSize: document.getElementById('logoSize'),
    logoSizeValue: document.getElementById('logoSizeValue'),
    logoBackground: document.getElementById('logoBackground'),
    logoPixelate: document.getElementById('logoPixelate'),
    logoPixelateSection: document.getElementById('logoPixelateSection'),
    logoPixelateAmount: document.getElementById('logoPixelateAmount'),
    logoPixelateAmountValue: document.getElementById('logoPixelateAmountValue'),
    logoPadding: document.getElementById('logoPadding'),
    logoPaddingValue: document.getElementById('logoPaddingValue'),
    
    // Efectos
    useGlow: document.getElementById('useGlow'),
    useShadow: document.getElementById('useShadow'),
    shadowSection: document.getElementById('shadowSection'),
    shadowIntensity: document.getElementById('shadowIntensity'),
    shadowIntensityValue: document.getElementById('shadowIntensityValue'),
    usePixelate: document.getElementById('usePixelate'),
    useInvert: document.getElementById('useInvert'),
    opacity: document.getElementById('opacity'),
    opacityValue: document.getElementById('opacityValue'),
    
    // Canvas y controles
    qrCanvas: document.getElementById('qrCanvas'),
    placeholderText: document.getElementById('placeholderText'),
    generateBtn: document.getElementById('generateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Zoom
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut'),
    resetZoom: document.getElementById('resetZoom'),
    
    // Export
    downloadPNG: document.getElementById('downloadPNG'),
    downloadJPG: document.getElementById('downloadJPG'),
    downloadSVG: document.getElementById('downloadSVG'),
    downloadPDF: document.getElementById('downloadPDF'),
    exportQuality: document.getElementById('exportQuality'),
    
    // Historial
    historyGrid: document.getElementById('historyGrid'),
    
    // Modal y notificaciones
    notification: document.getElementById('notification')
};

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeTabs();
    initializeNavigation();
    loadHistory();
    setupColorSync();
    setupSliderSync();
    setupPresets();
    setupFrameSelection();
    setupTemplates();
    elements.logoPixelateSection.style.display = elements.logoPixelate.checked ? 'block' : 'none';
    renderTemplatePreviews();
});

let previewGenerationToken = 0;

// === EVENT LISTENERS ===
function initializeEventListeners() {
    // Contador de caracteres
    elements.qrText.addEventListener('input', updateCharCount);
    
    // Generación de QR
    elements.generateBtn.addEventListener('click', generateQR);
    elements.resetBtn.addEventListener('click', resetForm);
    
    // Toggles con actualización en tiempo real
    elements.useGradient.addEventListener('change', () => {
        elements.gradientOptions.style.display = elements.useGradient.checked ? 'block' : 'none';
        updatePreview();
    });
    
    elements.roundedCorners.addEventListener('change', () => {
        elements.cornerRadiusSection.style.display = elements.roundedCorners.checked ? 'block' : 'none';
        updatePreview();
    });
    
    elements.useFrame.addEventListener('change', () => {
        elements.frameOptions.style.display = elements.useFrame.checked ? 'block' : 'none';
        updatePreview();
    });
    
    elements.useLogo.addEventListener('change', () => {
        elements.logoOptions.style.display = elements.useLogo.checked ? 'block' : 'none';
        updatePreview();
    });
    
    elements.useShadow.addEventListener('change', () => {
        elements.shadowSection.style.display = elements.useShadow.checked ? 'block' : 'none';
        updatePreview();
    });
    
    // Logo upload
    elements.triggerLogoUpload.addEventListener('click', () => {
        elements.logoUpload.click();
    });
    
    elements.logoUpload.addEventListener('change', handleLogoUpload);
    
    // Zoom
    elements.zoomIn.addEventListener('click', () => zoomCanvas(1.2));
    elements.zoomOut.addEventListener('click', () => zoomCanvas(0.8));
    elements.resetZoom.addEventListener('click', () => {
        currentZoom = 1;
        elements.qrCanvas.style.transform = 'scale(1)';
    });
    
    // Export
    elements.downloadPNG.addEventListener('click', () => downloadQR('png'));
    elements.downloadJPG.addEventListener('click', () => downloadQR('jpg'));
    elements.downloadSVG.addEventListener('click', () => downloadQR('svg'));
    elements.downloadPDF.addEventListener('click', () => downloadQR('pdf'));
    
    // Enter para generar
    elements.qrText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            generateQR();
        }
    });
    
    // Listeners para actualización en tiempo real
    setupLivePreviewListeners();
}

// === NAVEGACIÓN POR TABS ===
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// === NAVEGACIÓN PRINCIPAL ===
function initializeNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (section === 'templates') {
                document.getElementById('templatesModal').classList.add('active');
            } else if (section === 'gallery') {
                openGalleryModal();
            }
        });
    });
    
    // Cerrar modales
    document.getElementById('closeTemplates')?.addEventListener('click', () => {
        document.getElementById('templatesModal').classList.remove('active');
    });
    
    document.getElementById('closeGallery')?.addEventListener('click', () => {
        document.getElementById('galleryModal').classList.remove('active');
    });
}

// === SINCRONIZACIÓN DE COLORES ===
function setupColorSync() {
    const colorPairs = [
        [elements.primaryColor, elements.primaryColorHex],
        [elements.bgColor, elements.bgColorHex],
        [elements.secondaryColor, elements.secondaryColorHex],
        [elements.frameColor, elements.frameColorHex]
    ];
    
    colorPairs.forEach(([picker, hex]) => {
        if (picker && hex) {
            picker.addEventListener('input', () => {
                hex.value = picker.value.toUpperCase();
            });
            
            hex.addEventListener('input', () => {
                if (/^#[0-9A-F]{6}$/i.test(hex.value)) {
                    picker.value = hex.value;
                }
            });
        }
    });
}

// === SINCRONIZACIÓN DE SLIDERS ===
function setupSliderSync() {
    const sliders = [
        [elements.qrSize, elements.qrSizeValue],
        [elements.qrMargin, elements.qrMarginValue],
        [elements.gradientAngle, elements.gradientAngleValue],
        [elements.cornerRadius, elements.cornerRadiusValue],
        [elements.frameWidth, elements.frameWidthValue],
        [elements.logoSize, elements.logoSizeValue],
        [elements.logoPixelateAmount, elements.logoPixelateAmountValue],
        [elements.logoPadding, elements.logoPaddingValue],
        [elements.shadowIntensity, elements.shadowIntensityValue],
        [elements.opacity, elements.opacityValue]
    ];
    
    sliders.forEach(([slider, display]) => {
        if (slider && display) {
            slider.addEventListener('input', () => {
                display.textContent = slider.value;
            });
        }
    });
}

// === CONFIGURAR LISTENERS PARA ACTUALIZACIÓN EN TIEMPO REAL ===
function setupLivePreviewListeners() {
    // Texto y tipo de contenido
    elements.qrText.addEventListener('input', debounce(updatePreview, 300));
    elements.contentType.addEventListener('change', updatePreview);

    // Colores
    elements.primaryColor.addEventListener('input', debounce(updatePreview, 300));
    elements.primaryColorHex.addEventListener('input', debounce(updatePreview, 300));
    elements.bgColor.addEventListener('input', debounce(updatePreview, 300));
    elements.bgColorHex.addEventListener('input', debounce(updatePreview, 300));
    elements.secondaryColor.addEventListener('input', debounce(updatePreview, 300));
    elements.secondaryColorHex.addEventListener('input', debounce(updatePreview, 300));
    elements.frameColor.addEventListener('input', debounce(updatePreview, 300));
    elements.frameColorHex.addEventListener('input', debounce(updatePreview, 300));
    
    // Sliders
    elements.qrSize.addEventListener('input', debounce(updatePreview, 500));
    elements.qrMargin.addEventListener('input', debounce(updatePreview, 300));
    elements.gradientAngle.addEventListener('input', debounce(updatePreview, 200));
    elements.cornerRadius.addEventListener('input', debounce(updatePreview, 200));
    elements.frameWidth.addEventListener('input', debounce(updatePreview, 300));
    elements.logoSize.addEventListener('input', debounce(updatePreview, 300));
    elements.logoPadding.addEventListener('input', debounce(updatePreview, 300));
    elements.shadowIntensity.addEventListener('input', debounce(updatePreview, 200));
    elements.opacity.addEventListener('input', debounce(updatePreview, 200));
    
    // Selects
    elements.errorCorrection.addEventListener('change', updatePreview);
    elements.dotStyle.addEventListener('change', updatePreview);
    
    // Checkboxes de efectos
    elements.useGlow.addEventListener('change', updatePreview);
    elements.usePixelate.addEventListener('change', updatePreview);
    elements.useInvert.addEventListener('change', updatePreview);
    elements.logoBackground.addEventListener('change', updatePreview);
    elements.logoPixelate.addEventListener('change', () => {
        elements.logoPixelateSection.style.display = elements.logoPixelate.checked ? 'block' : 'none';
        updatePreview();
    });
    elements.logoPixelateAmount.addEventListener('input', debounce(updatePreview, 200));
    
    // Input de texto del marco
    elements.frameText.addEventListener('input', debounce(updatePreview, 500));
}

// === FUNCIÓN DEBOUNCE PARA OPTIMIZAR RENDIMIENTO ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === ACTUALIZAR PREVIEW EN TIEMPO REAL ===
function updatePreview() {
    void refreshQRPreview({ saveHistory: false, showFeedback: false });
}

// === PRESETS DE GRADIENTES ===
function setupPresets() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const [angle, color1, color2] = btn.dataset.gradient.split(',');
            
            elements.useGradient.checked = true;
            elements.gradientOptions.style.display = 'block';
            
            elements.gradientAngle.value = angle;
            elements.gradientAngleValue.textContent = angle;
            
            elements.primaryColor.value = color1;
            elements.primaryColorHex.value = color1.toUpperCase();
            
            elements.secondaryColor.value = color2;
            elements.secondaryColorHex.value = color2.toUpperCase();
            
            showNotification('Preset aplicado', 'success');
            updatePreview();
        });
    });
}

// === SELECCIÓN DE MARCO ===
function setupFrameSelection() {
    const frameItems = document.querySelectorAll('.frame-item');
    
    frameItems.forEach(item => {
        item.addEventListener('click', () => {
            frameItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            updatePreview();
        });
    });
}

// === TEMPLATES ===
function setupTemplates() {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            applyTemplate(template);
            document.getElementById('templatesModal').classList.remove('active');
        });
    });
}

function getTemplateDefinitions() {
    return {
        business: {
            label: 'Contacto profesional',
            description: 'vCard con web, teléfono y email',
            text: 'BEGIN:VCARD\nVERSION:3.0\nN:García;Laura;;\nFN:Laura García\nORG:QrForge Studio\nTITLE:Product Designer\nTEL;TYPE=WORK,VOICE:+34 600 123 456\nEMAIL;TYPE=WORK:laura.garcia@qrforge.studio\nURL:https://qrforge.studio\nADR;TYPE=WORK:;;Madrid;;28001;España\nEND:VCARD',
            type: 'vcard',
            primary: '#1e3a8a',
            secondary: '#3b82f6'
        },
        wifi: {
            label: 'Acceso WiFi',
            description: 'Red WPA2 lista para escanear',
            text: 'WIFI:T:WPA;S:QrForge-Guest;P:QrForge2026!;H:false;;',
            type: 'wifi',
            primary: '#059669',
            secondary: '#10b981'
        },
        social: {
            label: 'Red profesional',
            description: 'Perfil LinkedIn verificable',
            text: 'https://www.linkedin.com/in/laura-garcia-product-design/',
            type: 'url',
            primary: '#0f766e',
            secondary: '#14b8a6'
        },
        payment: {
            label: 'Cobro o checkout',
            description: 'Enlace de pago seguro',
            text: 'https://qrforge.studio/pay/INV-2026-0042',
            type: 'url',
            primary: '#f59e0b',
            secondary: '#fbbf24'
        },
        event: {
            label: 'Evento calendario',
            description: 'Invitación iCal profesional',
            text: 'BEGIN:VEVENT\nSUMMARY:Demo de producto QrForge\nDTSTART:20260422T170000Z\nDTEND:20260422T180000Z\nLOCATION:Online\nDESCRIPTION:Presentación de la nueva versión del generador QR\nEND:VEVENT',
            type: 'text',
            primary: '#7c3aed',
            secondary: '#a78bfa'
        },
        email: {
            label: 'Correo directo',
            description: 'mailto con asunto y cuerpo',
            text: 'mailto:contacto@qrforge.studio?subject=Solicitud%20de%20informaci%C3%B3n&body=Hola%20equipo%20de%20QrForge,%20quisiera%20conocer%20m%C3%A1s%20sobre%20sus%20servicios.',
            type: 'email',
            primary: '#dc2626',
            secondary: '#ef4444'
        }
    };
}

// === PREVISTAS DE PLANTILLAS ===
async function renderTemplatePreviews() {
    const previewConfigs = getTemplateDefinitions();

    const cards = document.querySelectorAll('.template-card');

    for (const card of cards) {
        const template = card.dataset.template;
        const config = previewConfigs[template];

        if (!config) {
            continue;
        }

        const preview = card.querySelector('.template-preview');
        if (!preview) {
            continue;
        }

        preview.innerHTML = '';

        try {
            const qrCode = new QRCodeStyling({
                width: 120,
                height: 120,
                type: 'svg',
                data: config.text,
                margin: 1,
                qrOptions: {
                    errorCorrectionLevel: 'M'
                },
                dotsOptions: {
                    color: config.primary,
                    type: 'rounded'
                },
                cornersSquareOptions: {
                    color: config.primary,
                    type: 'square'
                },
                cornersDotOptions: {
                    color: config.secondary,
                    type: 'dot'
                },
                backgroundOptions: {
                    color: '#ffffff'
                }
            });

            await qrCode.append(preview);
        } catch (error) {
            console.error(`Error rendering template preview for ${template}:`, error);
            preview.style.background = `linear-gradient(135deg, ${config.primary}, ${config.secondary})`;
        }
    }
}

function applyTemplate(template) {
    const templates = getTemplateDefinitions();
    const t = templates[template];
    if (t) {
        elements.qrText.value = t.text;
        elements.contentType.value = t.type;
        
        elements.useGradient.checked = true;
        elements.gradientOptions.style.display = 'block';
        
        elements.primaryColor.value = t.primary;
        elements.primaryColorHex.value = t.primary.toUpperCase();
        elements.secondaryColor.value = t.secondary;
        elements.secondaryColorHex.value = t.secondary.toUpperCase();
        
        updateCharCount();
        showNotification('Template aplicado', 'success');
        updatePreview();
    }
}

// === CONTADOR DE CARACTERES ===
function updateCharCount() {
    const count = elements.qrText.value.length;
    elements.charCount.textContent = count;
    
    if (count > 4296) {
        elements.charCount.style.color = 'var(--danger)';
    } else if (count > 3000) {
        elements.charCount.style.color = 'var(--warning)';
    } else {
        elements.charCount.style.color = 'var(--primary)';
    }
}

// === GENERACIÓN DE QR ===
async function generateQR() {
    await refreshQRPreview({ saveHistory: true, showFeedback: true });
}

// === GENERAR Y RENDERIZAR QR DESDE EL ESTADO ACTUAL ===
async function refreshQRPreview({ saveHistory = false, showFeedback = false } = {}) {
    const text = elements.qrText.value.trim();
    
    if (!text) {
        if (showFeedback) {
            showNotification('Por favor ingresa contenido para el QR', 'error');
        }
        return;
    }
    
    if (text.length > 4296) {
        if (showFeedback) {
            showNotification('El texto es demasiado largo (máx. 4296 caracteres)', 'error');
        }
        return;
    }
    
    const requestToken = ++previewGenerationToken;

    try {
        if (showFeedback) {
            elements.generateBtn.disabled = true;
            elements.generateBtn.innerHTML = '<span class="icon">⏳</span> Generando...';
        }

        const qrOptions = buildQROptions(text);
        
        // Generar QR con QRCodeStyling
        const qrCode = new QRCodeStyling(qrOptions);
        
        // Convertir a data URL
        const blob = await qrCode.getRawData('png');
        const reader = new FileReader();
        
        reader.onloadend = async function() {
            if (requestToken !== previewGenerationToken) {
                return;
            }

            currentQRData = reader.result;
            await renderQR(reader.result);
            // Guardar el canvas final renderizado
            const finalQR = elements.qrCanvas.toDataURL('image/png');
            if (saveHistory) {
                saveToHistory(finalQR, text);
            }
            if (showFeedback) {
                showNotification('QR generado exitosamente', 'success');
            }

            if (showFeedback) {
                elements.generateBtn.disabled = false;
                elements.generateBtn.innerHTML = '<span class="icon">⚡</span> Generar QR';
            }
        };
        
        reader.readAsDataURL(blob);
        
    } catch (error) {
        console.error('Error:', error);
        if (showFeedback) {
            showNotification('Error al generar el QR', 'error');
            elements.generateBtn.disabled = false;
            elements.generateBtn.innerHTML = '<span class="icon">⚡</span> Generar QR';
        }
    }
}

// === CONSTRUIR CONFIGURACIÓN DEL QR ===
function buildQROptions(text) {
    const size = parseInt(elements.qrSize.value);

    // Mapear estilos de puntos
    const dotStyleMap = {
        'square': 'square',
        'rounded': 'rounded',
        'dots': 'dots',
        'classy': 'classy-rounded',
        'extra-rounded': 'extra-rounded'
    };

    return {
        width: size,
        height: size,
        data: text,
        margin: parseInt(elements.qrMargin.value),
        qrOptions: {
            typeNumber: 0,
            mode: 'Byte',
            errorCorrectionLevel: elements.errorCorrection.value
        },
        dotsOptions: {
            color: '#000000',
            type: dotStyleMap[elements.dotStyle.value] || 'square'
        },
        backgroundOptions: {
            color: '#FFFFFF'
        },
        cornersSquareOptions: {
            color: '#000000',
            type: dotStyleMap[elements.dotStyle.value] || 'square'
        },
        cornersDotOptions: {
            color: '#000000',
            type: dotStyleMap[elements.dotStyle.value] || 'square'
        }
    };
}

// === RENDERIZADO DEL QR ===
async function renderQR(qrDataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = elements.qrCanvas;
            const ctx = canvas.getContext('2d');
            
            // Configurar tamaño del canvas base
            const size = parseInt(elements.qrSize.value);
            canvas.width = size;
            canvas.height = size;
            
            // Limpiar canvas
            ctx.clearRect(0, 0, size, size);
            
            // Paso 1: Dibujar fondo
            ctx.fillStyle = elements.bgColor.value;
            ctx.fillRect(0, 0, size, size);
            
            // Paso 2: Dibujar QR base
            ctx.drawImage(img, 0, 0, size, size);
            
            // Paso 3: Aplicar colores o degradado al QR
            if (elements.useGradient.checked) {
                applyGradientToQR(ctx, size, img);
            } else if (elements.primaryColor.value !== '#000000') {
                // Aplicar color sólido al QR
                applyColorOnly(ctx, size);
            }
            
            // Paso 4: Los estilos de puntos ya vienen aplicados desde el servidor
            // No necesitamos hacer nada aquí
            
            // Paso 5: Aplicar esquinas redondeadas si está activado
            if (elements.roundedCorners.checked) {
                applyRoundedCorners(ctx, size);
            }
            
            // Paso 6: Aplicar efectos adicionales
            applyEffects(ctx, size);
            
            // Paso 7: Añadir logo
            if (elements.useLogo.checked && uploadedLogo) {
                addLogoToQR(ctx, size);
            }
            
            // Paso 8: Añadir marco
            if (elements.useFrame.checked) {
                addFrameToQR(ctx, size);
            }
            
            // Mostrar canvas
            elements.placeholderText.style.display = 'none';
            elements.qrCanvas.classList.add('active');
            elements.qrCanvas.style.display = 'block';
            
            resolve();
        };
        img.src = qrDataUrl;
    });
}

// === APLICAR COLOR SÓLIDO AL QR ===
function applyColorToQR(ctx, size, qrImage) {
    // Primero dibujar el QR base
    ctx.drawImage(qrImage, 0, 0, size, size);
    
    // Si el color no es negro, aplicar el color personalizado
    if (elements.primaryColor.value !== '#000000') {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Obtener componentes RGB del color primario
        const color = elements.primaryColor.value;
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        
        // Aplicar el color solo a los píxeles oscuros
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness < 128) {
                data[i] = r;
                data[i + 1] = g;
                data[i + 2] = b;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
}

// === APLICAR SOLO COLOR (sin redibujar imagen) ===
function applyColorOnly(ctx, size) {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    // Obtener componentes RGB del color primario
    const color = elements.primaryColor.value;
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    
    // Aplicar el color solo a los píxeles oscuros
    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness < 128) {
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// === APLICAR GRADIENTE AL QR ===
function applyGradientToQR(ctx, size, qrImage) {
    // Obtener los datos de la imagen actual (que ya tiene el QR dibujado)
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    // Crear un canvas temporal para el gradiente
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Calcular las coordenadas del gradiente basado en el ángulo
    const angle = parseInt(elements.gradientAngle.value) * Math.PI / 180;
    const x1 = size / 2 + Math.cos(angle) * size / 2;
    const y1 = size / 2 + Math.sin(angle) * size / 2;
    const x2 = size / 2 - Math.cos(angle) * size / 2;
    const y2 = size / 2 - Math.sin(angle) * size / 2;
    
    // Crear el gradiente
    const gradient = tempCtx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, elements.primaryColor.value);
    gradient.addColorStop(1, elements.secondaryColor.value);
    
    // Llenar con el gradiente
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, size, size);
    
    // Obtener los datos del gradiente
    const gradientData = tempCtx.getImageData(0, 0, size, size);
    const gradData = gradientData.data;
    
    // Aplicar el gradiente solo a los píxeles oscuros del QR
    for (let i = 0; i < data.length; i += 4) {
        // Si el píxel es oscuro (parte del QR)
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness < 128) {
            // Reemplazar con el color del gradiente
            data[i] = gradData[i];         // R
            data[i + 1] = gradData[i + 1]; // G
            data[i + 2] = gradData[i + 2]; // B
            // Alpha se mantiene
        }
    }
    
    // Poner los datos modificados de vuelta en el canvas
    ctx.putImageData(imageData, 0, 0);
}

// === APLICAR ESTILOS DE PUNTOS ===
function applyDotStyle(ctx, size) {
    const style = elements.dotStyle.value;
    
    if (style === 'square') return;
    
    // Obtener los datos de píxeles del QR
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    // Detectar el tamaño de cada módulo (cuadradito) del QR
    // Escaneamos para encontrar el primer módulo oscuro
    let moduleSize = 0;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            if (data[i] < 128) { // Píxel oscuro encontrado
                // Contar cuántos píxeles oscuros hay en horizontal
                let count = 0;
                for (let dx = x; dx < size; dx++) {
                    const j = (y * size + dx) * 4;
                    if (data[j] < 128) count++;
                    else break;
                }
                moduleSize = count;
                break;
            }
        }
        if (moduleSize > 0) break;
    }
    
    if (moduleSize === 0) return;
    
    // Crear un mapa de módulos (matriz del QR)
    const modules = Math.ceil(size / moduleSize);
    const qrMatrix = [];
    
    for (let row = 0; row < modules; row++) {
        qrMatrix[row] = [];
        for (let col = 0; col < modules; col++) {
            const x = col * moduleSize + Math.floor(moduleSize / 2);
            const y = row * moduleSize + Math.floor(moduleSize / 2);
            if (x < size && y < size) {
                const i = (y * size + x) * 4;
                qrMatrix[row][col] = data[i] < 128; // true = oscuro, false = claro
            } else {
                qrMatrix[row][col] = false;
            }
        }
    }
    
    // Limpiar canvas y redibujar con nuevas formas
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = elements.bgColor.value;
    ctx.fillRect(0, 0, size, size);
    
    // Obtener el color actual del QR del canvas temporal
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // Dibujar cada módulo con la forma elegida
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            if (qrMatrix[row][col]) {
                const x = col * moduleSize;
                const y = row * moduleSize;
                
                // Obtener el color del módulo original
                const centerX = x + Math.floor(moduleSize / 2);
                const centerY = y + Math.floor(moduleSize / 2);
                const i = (centerY * size + centerX) * 4;
                ctx.fillStyle = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
                
                drawModule(ctx, x, y, moduleSize, style);
            }
        }
    }
}

// === DIBUJAR MÓDULO CON FORMA ESPECÍFICA ===
function drawModule(ctx, x, y, size, style) {
    ctx.save();
    
    switch(style) {
        case 'rounded':
            // Cuadrados con esquinas redondeadas
            const radius = size * 0.3;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + size - radius, y);
            ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
            ctx.lineTo(x + size, y + size - radius);
            ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
            ctx.lineTo(x + radius, y + size);
            ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'dots':
            // Círculos
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2.2, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'extra-rounded':
            // Círculos más grandes que se tocan
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 1.8, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'classy':
            // Forma elegante con esquinas muy suaves
            const r = size * 0.4;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + size - r, y);
            ctx.quadraticCurveTo(x + size, y, x + size, y + r);
            ctx.lineTo(x + size, y + size - r);
            ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
            ctx.lineTo(x + r, y + size);
            ctx.quadraticCurveTo(x, y + size, x, y + size - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            break;
            
        default:
            ctx.fillRect(x, y, size, size);
    }
    
    ctx.restore();
}

// === APLICAR ESQUINAS REDONDEADAS ===
function applyRoundedCorners(ctx, size) {
    const radius = parseInt(elements.cornerRadius.value);
    
    // Crear canvas temporal con el contenido actual
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copiar el contenido actual
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    // Limpiar el canvas original
    ctx.clearRect(0, 0, size, size);
    
    // Crear máscara con esquinas redondeadas
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
    
    // Dibujar el contenido con la máscara aplicada
    ctx.drawImage(tempCanvas, 0, 0);
}

// === APLICAR EFECTOS ===
function applyEffects(ctx, size) {
    // Crear canvas temporal para efectos no destructivos
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copiar contenido actual
    tempCtx.drawImage(ctx.canvas, 0, 0);
    
    // Invertir colores
    if (elements.useInvert.checked) {
        const imageData = tempCtx.getImageData(0, 0, size, size);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        tempCtx.putImageData(imageData, 0, 0);
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    if (elements.usePixelate.checked) {
        applyPixelateEffect(ctx, size);
    }
    
    // Opacidad
    if (elements.opacity.value != 100) {
        ctx.globalAlpha = elements.opacity.value / 100;
    }
    
    // Sombra o Glow - aplicar antes de dibujar
    if (elements.useShadow.checked) {
        const intensity = parseInt(elements.shadowIntensity.value);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = intensity;
        ctx.shadowOffsetX = intensity / 2;
        ctx.shadowOffsetY = intensity / 2;
    } else if (elements.useGlow.checked) {
        ctx.shadowColor = elements.primaryColor.value;
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

// === APLICAR EFECTO PIXELADO ===
function applyPixelateEffect(ctx, size) {
    const pixelSize = Math.max(4, Math.round(size / 40));
    const reducedSize = Math.max(1, Math.floor(size / pixelSize));

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = size;
    sourceCanvas.height = size;
    const sourceCtx = sourceCanvas.getContext('2d');
    sourceCtx.drawImage(ctx.canvas, 0, 0);

    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = reducedSize;
    pixelCanvas.height = reducedSize;
    const pixelCtx = pixelCanvas.getContext('2d');
    pixelCtx.imageSmoothingEnabled = false;
    pixelCtx.drawImage(sourceCanvas, 0, 0, reducedSize, reducedSize);

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelCanvas, 0, 0, reducedSize, reducedSize, 0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
}



// === AÑADIR LOGO ===
function addLogoToQR(ctx, size) {
    if (!uploadedLogo) return;
    
    const logoSizePercent = parseInt(elements.logoSize.value) / 100;
    const logoSize = size * logoSizePercent;
    const x = (size - logoSize) / 2;
    const y = (size - logoSize) / 2;
    
    // Fondo del logo
    if (elements.logoBackground.checked) {
        const padding = parseInt(elements.logoPadding.value);
        ctx.fillStyle = elements.bgColor.value;
        ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);
    }

    if (elements.logoPixelate.checked) {
        drawPixelatedImage(ctx, uploadedLogo, x, y, logoSize, logoSize);
    } else {
        ctx.drawImage(uploadedLogo, x, y, logoSize, logoSize);
    }
}

// === DIBUJAR IMAGEN PIXELADA ===
function drawPixelatedImage(ctx, image, x, y, width, height) {
    const pixelation = Math.max(2, parseInt(elements.logoPixelateAmount.value));
    const smallWidth = Math.max(1, Math.floor(width / pixelation));
    const smallHeight = Math.max(1, Math.floor(height / pixelation));

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const sourceCtx = sourceCanvas.getContext('2d');
    sourceCtx.imageSmoothingEnabled = false;
    sourceCtx.drawImage(image, 0, 0, width, height);

    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = smallWidth;
    pixelCanvas.height = smallHeight;
    const pixelCtx = pixelCanvas.getContext('2d');
    pixelCtx.imageSmoothingEnabled = false;
    pixelCtx.drawImage(sourceCanvas, 0, 0, smallWidth, smallHeight);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pixelCanvas, 0, 0, smallWidth, smallHeight, x, y, width, height);
    ctx.imageSmoothingEnabled = true;
}

// === AÑADIR MARCO ===
function addFrameToQR(ctx, size) {
    const frameWidth = parseInt(elements.frameWidth.value);
    const frameText = elements.frameText.value || 'ESCANÉAME';
    const activeFrame = document.querySelector('.frame-item.active')?.dataset.frame || 'modern';
    
    // Crear canvas temporal con el QR actual
    const qrCanvas = document.createElement('canvas');
    qrCanvas.width = size;
    qrCanvas.height = size;
    const qrCtx = qrCanvas.getContext('2d');
    qrCtx.drawImage(elements.qrCanvas, 0, 0);
    
    // Expandir canvas principal
    const newSize = size + frameWidth * 2;
    elements.qrCanvas.width = newSize;
    elements.qrCanvas.height = newSize;
    
    // Dibujar marco según estilo
    drawFrame(ctx, newSize, frameWidth, activeFrame);
    
    // Copiar QR al centro del nuevo canvas
    ctx.drawImage(qrCanvas, frameWidth, frameWidth);
    
    // Añadir texto si existe
    if (frameText.trim()) {
        const fontSize = Math.max(frameWidth * 0.35, 16);
        ctx.fillStyle = getContrastColor(elements.frameColor.value);
        ctx.font = `bold ${fontSize}px Orbitron, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Añadir sombra al texto para mejor legibilidad
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(frameText.toUpperCase(), newSize / 2, newSize - frameWidth / 2.5);
        
        // Resetear sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

// === DIBUJAR MARCO ===
function drawFrame(ctx, size, width, style) {
    const frameColor = elements.frameColor.value;
    const qrSize = size - width * 2;
    const qrX = width;
    const qrY = width;
    
    // Resetear efectos
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    switch (style) {
        case 'modern':
            // Marco con esquinas redondeadas grandes
            ctx.fillStyle = frameColor;
            roundRect(ctx, 0, 0, size, size, 30);
            ctx.fill();
            break;
            
        case 'classic':
            // Marco cuadrado clásico con borde
            ctx.fillStyle = frameColor;
            ctx.fillRect(0, 0, size, size);
            // Borde interno más oscuro
            ctx.strokeStyle = lightenColor(frameColor, -20);
            ctx.lineWidth = 4;
            ctx.strokeRect(width - 2, width - 2, qrSize + 4, qrSize + 4);
            break;
            
        case 'neon':
            // Marco circular/redondeado
            ctx.fillStyle = frameColor;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'cyber':
            // Marco con esquinas cortadas (estilo tecnológico)
            ctx.fillStyle = frameColor;
            const cutSize = 25;
            ctx.beginPath();
            ctx.moveTo(cutSize, 0);
            ctx.lineTo(size - cutSize, 0);
            ctx.lineTo(size, cutSize);
            ctx.lineTo(size, size - cutSize);
            ctx.lineTo(size - cutSize, size);
            ctx.lineTo(cutSize, size);
            ctx.lineTo(0, size - cutSize);
            ctx.lineTo(0, cutSize);
            ctx.closePath();
            ctx.fill();
            break;
            
        case 'minimal':
            // Marco rectangular simple negro
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, size, size);
            break;
            
        case 'elegant':
            // Marco con esquinas muy redondeadas (como pastilla)
            ctx.fillStyle = frameColor;
            roundRect(ctx, 0, 0, size, size, 50);
            ctx.fill();
            break;
            
        default:
            ctx.fillStyle = frameColor;
            ctx.fillRect(0, 0, size, size);
    }
}

// === FUNCIÓN AUXILIAR PARA RECTÁNGULOS REDONDEADOS ===
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// === UPLOAD LOGO ===
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            uploadedLogo = img;
            showNotification('Logo cargado correctamente', 'success');
            updatePreview();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// === ZOOM ===
function zoomCanvas(factor) {
    currentZoom *= factor;
    currentZoom = Math.max(0.5, Math.min(currentZoom, 3));
    elements.qrCanvas.style.transform = `scale(${currentZoom})`;
}

// === DESCARGAR QR ===
async function downloadQR(format) {
    if (!currentQRData) {
        showNotification('Primero genera un QR', 'error');
        return;
    }
    
    const canvas = elements.qrCanvas;
    const quality = parseInt(elements.exportQuality.value);

    // Crear canvas de alta calidad
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * quality;
    exportCanvas.height = canvas.height * quality;
    const ctx = exportCanvas.getContext('2d');
    ctx.scale(quality, quality);
    ctx.drawImage(canvas, 0, 0);

    let dataUrl, filename;

    try {
        switch (format) {
            case 'png':
                dataUrl = exportCanvas.toDataURL('image/png');
                filename = `qr-${Date.now()}.png`;
                break;
            case 'jpg':
                dataUrl = exportCanvas.toDataURL('image/jpeg', 0.95);
                filename = `qr-${Date.now()}.jpg`;
                break;
            case 'svg':
                dataUrl = createSafeSVGDownloadDataUrl(canvas);
                filename = `qr-${Date.now()}.svg`;
                break;
            case 'pdf':
                await downloadPDFExport(createPdfExportCanvas(canvas, quality), `qr-${Date.now()}.pdf`);
                showNotification('QR descargado como PDF', 'success');
                return;
            default:
                showNotification('Formato no soportado', 'error');
                return;
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();

        showNotification(`QR descargado como ${format.toUpperCase()}`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification(`Error al exportar ${format.toUpperCase()}`, 'error');
    }
}

// === CREAR EXPORTACIÓN SVG SEGURA ===
function createSafeSVGDownloadDataUrl(canvas) {
    const imageData = canvas.toDataURL('image/png');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <rect width="100%" height="100%" fill="${elements.bgColor.value}"/>
  <image width="${canvas.width}" height="${canvas.height}" href="${imageData}" xlink:href="${imageData}" preserveAspectRatio="none"/>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// === PREPARAR CANVAS PARA PDF ===
function createPdfExportCanvas(canvas, quality) {
    const pdfQuality = Math.max(1, Math.min(2, quality));
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width * pdfQuality;
    exportCanvas.height = canvas.height * pdfQuality;
    const ctx = exportCanvas.getContext('2d');
    ctx.scale(pdfQuality, pdfQuality);
    ctx.drawImage(canvas, 0, 0);
    return exportCanvas;
}

// === DESCARGAR PDF DESDE EL SERVIDOR ===
async function downloadPDFExport(canvas, filename) {
    const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            imageData: canvas.toDataURL('image/png'),
            filename,
            width: canvas.width,
            height: canvas.height
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `PDF export failed (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = objectUrl;
    link.click();
    URL.revokeObjectURL(objectUrl);
}

// === GALERÍA MODAL ===
function openGalleryModal() {
    const modal = document.getElementById('galleryModal');
    const grid = document.getElementById('galleryModalGrid');
    
    grid.innerHTML = '';
    
    if (qrHistory.length === 0) {
        grid.innerHTML = '<p class="empty-state">No hay QRs en tu galería aún.<br>Genera tu primer QR para comenzar.</p>';
    } else {
        qrHistory.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.innerHTML = `
                <div class="gallery-card-image">
                    <img src="${item.qrData}" alt="QR ${index + 1}">
                </div>
                <div class="gallery-card-info">
                    <p class="gallery-card-text">${item.text}</p>
                    <p class="gallery-card-date">${new Date(item.timestamp).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
                <div class="gallery-card-actions">
                    <button class="gallery-action-btn load-btn" title="Cargar en editor">
                        <span class="icon">📥</span>
                    </button>
                    <button class="gallery-action-btn download-btn" title="Descargar">
                        <span class="icon">💾</span>
                    </button>
                    <button class="gallery-action-btn delete-btn" title="Eliminar">
                        <span class="icon">🗑️</span>
                    </button>
                </div>
            `;
            
            // Cargar en editor
            card.querySelector('.load-btn').addEventListener('click', () => {
                currentQRData = item.qrData;
                const img = new Image();
                img.onload = () => {
                    const ctx = elements.qrCanvas.getContext('2d');
                    elements.qrCanvas.width = img.width;
                    elements.qrCanvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    elements.placeholderText.style.display = 'none';
                    elements.qrCanvas.classList.add('active');
                    elements.qrCanvas.style.display = 'block';
                    modal.classList.remove('active');
                    showNotification('QR cargado en el editor', 'success');
                };
                img.src = item.qrData;
            });
            
            // Descargar
            card.querySelector('.download-btn').addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `qr-${Date.now()}.png`;
                link.href = item.qrData;
                link.click();
                showNotification('QR descargado', 'success');
            });
            
            // Eliminar
            card.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('¿Estás seguro de eliminar este QR?')) {
                    deleteHistoryItem(index);
                    openGalleryModal();
                    showNotification('QR eliminado', 'success');
                }
            });
            
            grid.appendChild(card);
        });
    }
    
    modal.classList.add('active');
}

// === HISTORIAL ===
function saveToHistory(qrData, text) {
    const historyItem = {
        qrData,
        text: text.substring(0, 50),
        timestamp: Date.now()
    };
    
    qrHistory.unshift(historyItem);
    
    // Limitar a 20 items
    if (qrHistory.length > 20) {
        qrHistory = qrHistory.slice(0, 20);
    }
    
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
    loadHistory();
}

function loadHistory() {
    const grid = elements.historyGrid;
    grid.innerHTML = '';
    
    if (qrHistory.length === 0) {
        grid.innerHTML = '<p class="empty-state">No hay QRs generados aún</p>';
        return;
    }
    
    // Botón para borrar todo
    const clearAllBtn = document.createElement('button');
    clearAllBtn.className = 'clear-all-history';
    clearAllBtn.innerHTML = '<span class="icon">🗑️</span> Borrar Todo';
    clearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
            qrHistory = [];
            localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
            loadHistory();
            showNotification('Historial borrado', 'success');
        }
    });
    grid.appendChild(clearAllBtn);
    
    qrHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <img src="${item.qrData}" alt="QR ${index + 1}">
            <button class="delete-history-item" title="Borrar">
                <span class="icon">✕</span>
            </button>
        `;
        
        // Click en la imagen para cargar el QR
        div.querySelector('img').addEventListener('click', () => {
            currentQRData = item.qrData;
            const img = new Image();
            img.onload = () => {
                const ctx = elements.qrCanvas.getContext('2d');
                elements.qrCanvas.width = img.width;
                elements.qrCanvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                elements.placeholderText.style.display = 'none';
                elements.qrCanvas.classList.add('active');
                elements.qrCanvas.style.display = 'block';
            };
            img.src = item.qrData;
        });
        
        // Click en el botón de borrar
        div.querySelector('.delete-history-item').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHistoryItem(index);
        });
        
        grid.appendChild(div);
    });
}

// === BORRAR ITEM DEL HISTORIAL ===
function deleteHistoryItem(index) {
    qrHistory.splice(index, 1);
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
    loadHistory();
    showNotification('QR eliminado del historial', 'success');
}

// === RESETEAR FORMULARIO ===
function resetForm() {
    elements.qrText.value = '';
    elements.contentType.value = 'text';
    elements.primaryColor.value = '#6366f1';
    elements.primaryColorHex.value = '#6366f1';
    elements.bgColor.value = '#ffffff';
    elements.bgColorHex.value = '#ffffff';
    elements.useGradient.checked = false;
    elements.gradientOptions.style.display = 'none';
    elements.qrSize.value = 500;
    elements.qrSizeValue.textContent = '500';
    elements.qrMargin.value = 1;
    elements.qrMarginValue.textContent = '1';
    elements.errorCorrection.value = 'M';
    elements.useFrame.checked = false;
    elements.frameOptions.style.display = 'none';
    elements.useLogo.checked = false;
    elements.logoOptions.style.display = 'none';
    uploadedLogo = null;
    
    elements.qrCanvas.style.display = 'none';
    elements.qrCanvas.classList.remove('active');
    elements.placeholderText.style.display = 'block';
    
    updateCharCount();
    showNotification('Formulario reseteado', 'success');
}

// === NOTIFICACIONES ===
function showNotification(message, type = 'success') {
    const notification = elements.notification;
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// === UTILIDADES DE COLOR ===
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (
        0x1000000 +
        R * 0x10000 +
        G * 0x100 +
        B
    ).toString(16).slice(1);
}

function getContrastColor(hexColor) {
    // Convertir hex a RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retornar blanco o negro según la luminancia
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// === ATAJOS DE TECLADO ===
document.addEventListener('keydown', (e) => {
    // Ctrl + G: Generar QR
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        generateQR();
    }
    
    // Ctrl + R: Reset
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        resetForm();
    }
    
    // Ctrl + S: Descargar PNG
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        downloadQR('png');
    }
});
