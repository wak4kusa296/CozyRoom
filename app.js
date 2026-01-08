/**
 * メインアプリケーション
 */

// ========== DOM要素の取得 ==========

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('processedCanvas');
const originalPlaceholder = document.getElementById('originalPlaceholder');
const processedPlaceholder = document.getElementById('processedPlaceholder');
const downloadBtn = document.getElementById('downloadBtn');
const processBtn = document.getElementById('processBtn');
const resetBtn = document.getElementById('resetBtn');

// フィルターコントロール
const xbrzEnabled = document.getElementById('xbrzEnabled');
const xbrzScale = document.getElementById('xbrzScale');
const xbrzControls = document.getElementById('xbrzControls');

const kuwaharaEnabled = document.getElementById('kuwaharaEnabled');
const kuwaharaSize = document.getElementById('kuwaharaSize');
const kuwaharaSizeValue = document.getElementById('kuwaharaSizeValue');
const kuwaharaStrength = document.getElementById('kuwaharaStrength');
const kuwaharaStrengthValue = document.getElementById('kuwaharaStrengthValue');
const kuwaharaAlpha = document.getElementById('kuwaharaAlpha');
const kuwaharaAlphaValue = document.getElementById('kuwaharaAlphaValue');
const kuwaharaSharpness = document.getElementById('kuwaharaSharpness');
const kuwaharaSharpnessValue = document.getElementById('kuwaharaSharpnessValue');
const kuwaharaColorPalette = document.getElementById('kuwaharaColorPalette');
const kuwaharaControls = document.getElementById('kuwaharaControls');

const roughEnabled = document.getElementById('roughEnabled');
const roughAmount = document.getElementById('roughAmount');
const roughAmountValue = document.getElementById('roughAmountValue');
const roughSize = document.getElementById('roughSize');
const roughSizeValue = document.getElementById('roughSizeValue');
const roughContrast = document.getElementById('roughContrast');
const roughContrastValue = document.getElementById('roughContrastValue');
const roughControls = document.getElementById('roughControls');

// ========== 状態管理 ==========

let originalImage = null;
let processedImage = null;

// ========== イベントリスナー ==========

// ファイル入力
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

// スライダー値の更新
kuwaharaSize.addEventListener('input', (e) => {
    kuwaharaSizeValue.textContent = e.target.value;
});

kuwaharaStrength.addEventListener('input', (e) => {
    kuwaharaStrengthValue.textContent = e.target.value + '%';
});

kuwaharaAlpha.addEventListener('input', (e) => {
    kuwaharaAlphaValue.textContent = parseFloat(e.target.value).toFixed(2);
});

kuwaharaSharpness.addEventListener('input', (e) => {
    kuwaharaSharpnessValue.textContent = parseFloat(e.target.value).toFixed(1);
});

roughAmount.addEventListener('input', (e) => {
    roughAmountValue.textContent = e.target.value;
});

roughSize.addEventListener('input', (e) => {
    roughSizeValue.textContent = e.target.value;
});

roughContrast.addEventListener('input', (e) => {
    roughContrastValue.textContent = e.target.value + '%';
});

// フィルター有効/無効
xbrzEnabled.addEventListener('change', (e) => {
    toggleFilterControls(xbrzControls, e.target.checked);
});

kuwaharaEnabled.addEventListener('change', (e) => {
    toggleFilterControls(kuwaharaControls, e.target.checked);
});

roughEnabled.addEventListener('change', (e) => {
    toggleFilterControls(roughControls, e.target.checked);
});

// 処理ボタン
processBtn.addEventListener('click', processImage);

// リセットボタン
resetBtn.addEventListener('click', resetAll);

// ダウンロードボタン
downloadBtn.addEventListener('click', downloadImage);

// ========== 関数定義 ==========

/**
 * フィルターコントロールの有効/無効を切り替え
 */
function toggleFilterControls(controls, enabled) {
    const inputs = controls.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.disabled = !enabled;
    });
}

/**
 * ファイル選択処理
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
}

/**
 * ドラッグオーバー処理
 */
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

/**
 * ドラッグリーブ処理
 */
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

/**
 * ドロップ処理
 */
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
}

/**
 * 画像を読み込み
 */
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            displayOriginalImage(img);
            processBtn.disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * 元画像を表示
 */
function displayOriginalImage(img) {
    const maxWidth = originalCanvas.parentElement.clientWidth - 40;
    const maxHeight = 500;
    
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }
    
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    originalCanvas.style.width = width + 'px';
    originalCanvas.style.height = height + 'px';
    
    const ctx = originalCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // Nearest補間
    ctx.drawImage(img, 0, 0);
    
    originalPlaceholder.classList.add('hidden');
}

/**
 * 画像処理を実行
 */
function processImage() {
    if (!originalImage) return;
    
    processBtn.disabled = true;
    processBtn.innerHTML = '<span class="btn-icon">⏳</span><span>処理中...</span>';
    
    // 非同期処理（UIブロックを防ぐ）
    setTimeout(() => {
        try {
            let canvas = imageToCanvas(originalImage);
            
            // フィルター適用順序: xBRZ → ラフ → Kuwahara → 色パレット階調化
            
            // 元画像のImageDataを保存（色パレット階調化で使用）
            const originalCanvasForPalette = imageToCanvas(originalImage);
            const originalCtx = originalCanvasForPalette.getContext('2d');
            const originalImageData = originalCtx.getImageData(0, 0, originalCanvasForPalette.width, originalCanvasForPalette.height);
            
            // 1. xBRZフィルター
            if (xbrzEnabled.checked) {
                const scale = parseInt(xbrzScale.value);
                // xBRjsライブラリが読み込まれているか確認
                if (typeof window.xBRjs === 'undefined') {
                    console.warn('xBRjsライブラリがまだ読み込まれていません。少し待ってから再試行してください。');
                    alert('xBRjsライブラリの読み込みを待っています。ページを再読み込みするか、少し待ってから再試行してください。');
                    processBtn.disabled = false;
                    processBtn.innerHTML = '<span class="btn-icon">✨</span><span>処理を実行</span>';
                    return;
                }
                canvas = ImageFilters.applyXBRZ(canvas, scale);
            }
            
            // 2. ラフフィルター（ディスプレイスメント）
            if (roughEnabled.checked) {
                const amount = parseInt(roughAmount.value);
                const noiseSize = parseInt(roughSize.value);
                const contrast = parseInt(roughContrast.value);
                canvas = ImageFilters.applyRough(canvas, amount, noiseSize, contrast);
            }
            
            // 3. Kuwaharaフィルター
            if (kuwaharaEnabled.checked) {
                const windowSize = parseInt(kuwaharaSize.value);
                const strength = parseInt(kuwaharaStrength.value);
                const alpha = parseFloat(kuwaharaAlpha.value);
                const sharpness = parseFloat(kuwaharaSharpness.value);
                canvas = ImageFilters.applyKuwahara(canvas, windowSize, strength, alpha, sharpness);
                
                // 4. 色パレット階調化（トグルで制御）
                if (kuwaharaColorPalette.checked) {
                    canvas = ImageFilters.applyColorPaletteQuantization(canvas, originalImageData);
                }
            }
            
            processedImage = canvas;
            displayProcessedImage(canvas);
            downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('処理エラー:', error);
            alert('画像処理中にエラーが発生しました: ' + error.message);
        } finally {
            processBtn.disabled = false;
            processBtn.innerHTML = '<span class="btn-icon">✨</span><span>処理を実行</span>';
        }
    }, 10);
}

/**
 * 処理済み画像を表示
 */
function displayProcessedImage(canvas) {
    const maxWidth = processedCanvas.parentElement.clientWidth - 40;
    const maxHeight = 500;
    
    let width = canvas.width;
    let height = canvas.height;
    
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }
    
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    processedCanvas.style.width = width + 'px';
    processedCanvas.style.height = height + 'px';
    
    const ctx = processedCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // Nearest補間
    ctx.drawImage(canvas, 0, 0);
    
    processedPlaceholder.classList.add('hidden');
}

/**
 * 画像をダウンロード
 */
function downloadImage() {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'processed-image.png';
    link.href = processedImage.toDataURL('image/png');
    link.click();
}

/**
 * すべてをリセット
 */
function resetAll() {
    originalImage = null;
    processedImage = null;
    
    originalCanvas.width = 0;
    originalCanvas.height = 0;
    processedCanvas.width = 0;
    processedCanvas.height = 0;
    
    originalPlaceholder.classList.remove('hidden');
    processedPlaceholder.classList.remove('hidden');
    
    fileInput.value = '';
    processBtn.disabled = true;
    downloadBtn.disabled = true;
    
    // フィルター設定をリセット
    xbrzEnabled.checked = true;
    xbrzScale.value = '3';
    
    kuwaharaEnabled.checked = false;
    kuwaharaSize.value = '5';
    kuwaharaSizeValue.textContent = '5';
    kuwaharaStrength.value = '100';
    kuwaharaStrengthValue.textContent = '100%';
    kuwaharaAlpha.value = '0.50';
    kuwaharaAlphaValue.textContent = '0.50';
    kuwaharaSharpness.value = '15.0';
    kuwaharaSharpnessValue.textContent = '15.0';
    kuwaharaColorPalette.checked = true;
    
    roughEnabled.checked = false;
    roughAmount.value = '20';
    roughAmountValue.textContent = '20';
    roughSize.value = '2';
    roughSizeValue.textContent = '2';
    roughContrast.value = '50';
    roughContrastValue.textContent = '50%';
    
    toggleFilterControls(xbrzControls, true);
    toggleFilterControls(kuwaharaControls, false);
    toggleFilterControls(roughControls, false);
}

// ========== 初期化 ==========

// 初期状態でフィルターコントロールを設定
toggleFilterControls(xbrzControls, xbrzEnabled.checked);
toggleFilterControls(kuwaharaControls, kuwaharaEnabled.checked);
toggleFilterControls(roughControls, roughEnabled.checked);
