/**
 * 画像フィルター実装
 * xBRZ、Kuwahara、ラフフィルター
 * 
 * xBRZフィルターには xBRjs (https://github.com/joseprio/xBRjs) を使用
 * MIT License - Copyright (c) 2020 Josep del Rio
 */

// ========== ユーティリティ関数 ==========

/**
 * 画像をCanvasに変換
 */
function imageToCanvas(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
}

/**
 * CanvasからImageDataを取得
 */
function getImageData(canvas) {
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * ImageDataをCanvasに描画
 */
function putImageData(canvas, imageData) {
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
}

/**
 * ピクセル値を取得（境界チェック付き）
 */
function getPixel(imageData, x, y) {
    const width = imageData.width;
    const height = imageData.height;
    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));
    const index = (y * width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

/**
 * ピクセル値を設定
 */
function setPixel(imageData, x, y, r, g, b, a = 255) {
    const width = imageData.width;
    const index = (y * width + x) * 4;
    imageData.data[index] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
}

// ========== xBRZ フィルター (xBRjs使用) ==========

/**
 * xBRZフィルター（xBRjsライブラリを使用）
 * https://github.com/joseprio/xBRjs (MIT License)
 */
function applyXBRZ(inputCanvas, scale) {
    // xBRjsライブラリが利用可能かチェック
    // xBRjsは window.xBRjs オブジェクトとしてエクスポートされる
    let xBRjs = window.xBRjs;
    
    if (!xBRjs) {
        console.error('xBRjsライブラリが読み込まれていません。', {
            'window.xBRjs': typeof window.xBRjs,
            'window keys': Object.keys(window).filter(k => k.toLowerCase().includes('xbr'))
        });
        console.warn('フォールバック実装（バイキュービック補間）を使用します。');
        return applyXBRZFallback(inputCanvas, scale);
    }
    
    const xbr2x = xBRjs.xbr2x;
    const xbr3x = xBRjs.xbr3x;
    const xbr4x = xBRjs.xbr4x;
    
    if (!xbr2x || !xbr3x || !xbr4x) {
        console.error('xBRjs関数が利用できません。', {
            'xbr2x': typeof xbr2x,
            'xbr3x': typeof xbr3x,
            'xbr4x': typeof xbr4x
        });
        return applyXBRZFallback(inputCanvas, scale);
    }
    
    console.log('xBRjsライブラリを使用してスケーリングを実行:', scale + 'x');
    
    const inputData = getImageData(inputCanvas);
    const width = inputData.width;
    const height = inputData.height;
    
    // xBRjsは2x, 3x, 4xのみサポート
    let xbrFunction;
    let actualScale = scale;
    
    if (scale === 2) {
        xbrFunction = xbr2x;
    } else if (scale === 3) {
        xbrFunction = xbr3x;
    } else if (scale === 4) {
        xbrFunction = xbr4x;
    } else {
        // その他の倍率は4倍でスケール
        xbrFunction = xbr4x;
        actualScale = 4;
    }
    
    // RGBA形式からARGB形式に変換
    const originalPixels = new Uint32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        const r = inputData.data[i * 4];
        const g = inputData.data[i * 4 + 1];
        const b = inputData.data[i * 4 + 2];
        const a = inputData.data[i * 4 + 3];
        // ARGB形式: (A << 24) | (R << 16) | (G << 8) | B
        originalPixels[i] = (a << 24) | (r << 16) | (g << 8) | b;
    }
    
    // xBRjsでスケーリング
    const scaledPixelView = xbrFunction(originalPixels, width, height, {
        blendColors: true,
        scaleAlpha: false
    });
    
    // 結果をCanvasに描画
    const newWidth = width * actualScale;
    const newHeight = height * actualScale;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = newWidth;
    outputCanvas.height = newHeight;
    const ctx = outputCanvas.getContext('2d');
    const scaledImageData = ctx.createImageData(newWidth, newHeight);
    
    // ARGB形式からRGBA形式に変換
    for (let i = 0; i < newWidth * newHeight; i++) {
        const argb = scaledPixelView[i];
        scaledImageData.data[i * 4] = (argb >> 16) & 0xFF;     // R
        scaledImageData.data[i * 4 + 1] = (argb >> 8) & 0xFF;  // G
        scaledImageData.data[i * 4 + 2] = argb & 0xFF;         // B
        scaledImageData.data[i * 4 + 3] = (argb >> 24) & 0xFF; // A
    }
    
    ctx.putImageData(scaledImageData, 0, 0);
    
    // 4倍以外の場合はリサイズ
    if (scale !== actualScale) {
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = width * scale;
        finalCanvas.height = height * scale;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.drawImage(outputCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
        return finalCanvas;
    }
    
    return outputCanvas;
}

/**
 * xBRjsが利用できない場合のフォールバック実装
 */
function applyXBRZFallback(inputCanvas, scale) {
    const inputData = getImageData(inputCanvas);
    const width = inputData.width;
    const height = inputData.height;
    const newWidth = width * scale;
    const newHeight = height * scale;
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = newWidth;
    outputCanvas.height = newHeight;
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(inputCanvas, 0, 0, newWidth, newHeight);
    return outputCanvas;
}

// ========== Kuwahara フィルター（異方性モード） ==========

/**
 * 輝度を計算
 */
function getLuminance(pixel) {
    return 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
}

/**
 * 勾配を計算（ソーベルフィルター）
 */
function computeGradient(imageData, x, y) {
    // アルファ値を考慮した勾配計算
    const getLumWithAlpha = (px, py) => {
        const p = getPixel(imageData, px, py);
        return getLuminance(p) * (p.a / 255.0); // アルファ値で重み付け
    };
    
    const p00 = getLumWithAlpha(x - 1, y - 1);
    const p01 = getLumWithAlpha(x, y - 1);
    const p02 = getLumWithAlpha(x + 1, y - 1);
    const p10 = getLumWithAlpha(x - 1, y);
    const p12 = getLumWithAlpha(x + 1, y);
    const p20 = getLumWithAlpha(x - 1, y + 1);
    const p21 = getLumWithAlpha(x, y + 1);
    const p22 = getLumWithAlpha(x + 1, y + 1);
    
    // ソーベルフィルター
    const gx = (-1 * p00 + 1 * p02) + (-2 * p10 + 2 * p12) + (-1 * p20 + 1 * p22);
    const gy = (-1 * p00 - 2 * p01 - 1 * p02) + (1 * p20 + 2 * p21 + 1 * p22);
    
    return { gx, gy };
}

/**
 * 異方性Kuwaharaフィルター
 * エッジ方向に沿った楕円形ウィンドウを使用
 */
function applyKuwahara(inputCanvas, windowSize, strength, alpha = 0.5, sharpness = 15.0) {
    const inputData = getImageData(inputCanvas);
    const width = inputData.width;
    const height = inputData.height;
    const radius = Math.floor(windowSize / 2);
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputData = outputCanvas.getContext('2d').createImageData(width, height);
    
    const blend = strength / 100.0;
    // alpha: 楕円のアスペクト比（0.1～1.0、小さいほど細長い）
    // sharpness: エッジ保持の強さ（1.0～30.0、大きいほどエッジが保持される）
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // 勾配を計算してエッジ方向を決定
            const gradient = computeGradient(inputData, x, y);
            const gx = gradient.gx;
            const gy = gradient.gy;
            
            // エッジの強度と方向
            const edgeStrength = Math.sqrt(gx * gx + gy * gy);
            let angle = 0;
            if (edgeStrength > 0.1) {
                angle = Math.atan2(gy, gx);
            }
            
            // 8方向のサブウィンドウを評価
            const numSectors = 8;
            let minVariance = Infinity;
            let bestMean = { r: 0, g: 0, b: 0 };
            let totalCount = 0; // すべてのセクターの合計カウントを追跡
            const sectorVariances = [];
            
            // 各セクターの分散を計算
            for (let sector = 0; sector < numSectors; sector++) {
                const sectorAngle = (sector * Math.PI * 2) / numSectors;
                
                // 楕円形のサンプリング領域
                let sumR = 0, sumG = 0, sumB = 0;
                let sumR2 = 0, sumG2 = 0, sumB2 = 0;
                let count = 0;
                
                // 楕円形の領域をサンプリング（重みなしで平均と分散を計算）
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        // 楕円形の重み計算
                        const cosA = Math.cos(sectorAngle);
                        const sinA = Math.sin(sectorAngle);
                        const rotatedX = dx * cosA - dy * sinA;
                        const rotatedY = dx * sinA + dy * cosA;
                        const ellipseDist = Math.sqrt(rotatedX * rotatedX / (alpha * alpha) + rotatedY * rotatedY);
                        
                        if (ellipseDist <= radius) {
                            const px = x + dx;
                            const py = y + dy;
                            const p = getPixel(inputData, px, py);
                            
                            // アルファ値が0より大きい場合、そのピクセルを考慮
                            // 部分的透過ピクセル（アルファ値0-1の間）も含めて処理
                            if (p.a > 0) {
                                // アルファ値で重み付け（透過度に応じて重みを調整）
                                // アルファ値が小さいピクセルも処理に含めることで、
                                // 透過エッジ部分が滑らかになる
                                const alphaWeight = p.a / 255.0;
                                // 部分的透過ピクセルにも適切に重みを付ける
                                sumR += p.r * alphaWeight;
                                sumG += p.g * alphaWeight;
                                sumB += p.b * alphaWeight;
                                sumR2 += p.r * p.r * alphaWeight;
                                sumG2 += p.g * p.g * alphaWeight;
                                sumB2 += p.b * p.b * alphaWeight;
                                count += alphaWeight;
                            }
                        }
                    }
                }
                
                if (count > 0.001) {
                    const meanR = sumR / count;
                    const meanG = sumG / count;
                    const meanB = sumB / count;
                    const variance = (sumR2 / count - meanR * meanR) +
                                   (sumG2 / count - meanG * meanG) +
                                   (sumB2 / count - meanB * meanB);
                    
                    totalCount += count;
                    sectorVariances.push({
                        variance: variance,
                        mean: { r: meanR, g: meanG, b: meanB },
                        angle: sectorAngle,
                        count: count
                    });
                }
            }
            
            // エッジ方向に近いセクターに優先度を与えて分散を調整
            if (sectorVariances.length > 0) {
                for (let i = 0; i < sectorVariances.length; i++) {
                    const angleDiff = Math.abs(angle - sectorVariances[i].angle);
                    const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff) / Math.PI;
                    
                    // sharpnessが高いほど、エッジ方向に近いセクターの分散を減らす（優先する）
                    // sharpnessが低いほど、すべてのセクターが同等に扱われる
                    const angleWeight = Math.exp(-normalizedAngleDiff * normalizedAngleDiff * sharpness);
                    const adjustedVariance = sectorVariances[i].variance * (1.0 + (1.0 - angleWeight) * 0.5);
                    
                    if (adjustedVariance < minVariance) {
                        minVariance = adjustedVariance;
                        bestMean = sectorVariances[i].mean;
                    }
                }
            }
            
            // 元のピクセルとブレンド（アルファ値が0より大きいすべてのピクセルに対して適用）
            const original = getPixel(inputData, x, y);
            
            // アルファ値が0より大きい場合、Kuwaharaフィルターを適用
            // 部分的透過ピクセル（アルファ値0-1の間）にも適用される
            if (original.a > 0) {
                if (minVariance < Infinity && totalCount > 0.001) {
                    // Kuwaharaフィルターを適用（アルファ値に関係なく適用）
                    const filteredR = Math.round(original.r * (1 - blend) + bestMean.r * blend);
                    const filteredG = Math.round(original.g * (1 - blend) + bestMean.g * blend);
                    const filteredB = Math.round(original.b * (1 - blend) + bestMean.b * blend);
                    
                    // 結果を設定（アルファ値は元の値を保持）
                    setPixel(outputData, x, y, filteredR, filteredG, filteredB, original.a);
                } else {
                    // フォールバック：元のピクセルをそのまま使用
                    setPixel(outputData, x, y, original.r, original.g, original.b, original.a);
                }
            } else {
                // 完全に透過しているピクセル（アルファ値=0）はそのまま
                setPixel(outputData, x, y, original.r, original.g, original.b, original.a);
            }
        }
    }
    
    putImageData(outputCanvas, outputData);
    
    // アルファチャンネルに対してガウシアンブラーを適用して滑らかにし、その後二値化
    // windowSizeに応じてぼかしの強度を調整
    const ctx = outputCanvas.getContext('2d');
    const blurredImageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    applyGaussianBlurToAlpha(blurredImageData, outputCanvas.width, outputCanvas.height, windowSize);
    ctx.putImageData(blurredImageData, 0, 0);
    
    return outputCanvas;
}

/**
 * アルファチャンネルに対してガウシアンブラーを適用してから二値化
 * windowSizeに応じてぼかしの強度を調整
 */
function applyGaussianBlurToAlpha(imageData, width, height, windowSize) {
    // windowSizeに応じてカーネルサイズとシグマを調整
    // windowSizeが大きいほど、より強いぼかしを適用
    const kernelSize = Math.max(3, Math.min(9, Math.floor(windowSize / 2) * 2 + 1));
    const sigma = windowSize / 5.0; // windowSizeに比例してシグマを調整
    const radius = Math.floor(kernelSize / 2);
    
    // ガウシアンカーネルを生成
    const kernel = [];
    let kernelSum = 0;
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            const distance = Math.sqrt(x * x + y * y);
            const value = Math.exp(-(distance * distance) / (2 * sigma * sigma));
            kernel.push(value);
            kernelSum += value;
        }
    }
    
    // カーネルを正規化
    for (let i = 0; i < kernel.length; i++) {
        kernel[i] /= kernelSum;
    }
    
    // アルファ値の配列を作成
    const alphaChannel = new Float32Array(width * height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        alphaChannel[i / 4] = imageData.data[i + 3];
    }
    
    // ガウシアンブラーを適用
    const blurredAlpha = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sum = 0;
            let kernelIndex = 0;
            
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = Math.max(0, Math.min(width - 1, x + kx));
                    const py = Math.max(0, Math.min(height - 1, y + ky));
                    const index = py * width + px;
                    sum += alphaChannel[index] * kernel[kernelIndex];
                    kernelIndex++;
                }
            }
            
            blurredAlpha[y * width + x] = sum;
        }
    }
    
    // 二値化（閾値128）
    const threshold = 128;
    for (let i = 0; i < imageData.data.length; i += 4) {
        const alphaIndex = i / 4;
        const blurredValue = blurredAlpha[alphaIndex];
        imageData.data[i + 3] = blurredValue >= threshold ? 255 : 0;
    }
}

// ========== ラフフィルター（ディスプレイスメント） ==========

/**
 * ラフフィルター（ノイズテクスチャを使ったディスプレイスメント）
 * ノイズテクスチャを使ってピクセル位置を変位させ、粗さを表現
 */
function applyRough(inputCanvas, amount, noiseSize, contrast) {
    const inputData = getImageData(inputCanvas);
    const width = inputData.width;
    const height = inputData.height;
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputData = outputCanvas.getContext('2d').createImageData(width, height);
    
    // ノイズ生成関数（パーリンノイズ風）
    const seed = 12345;
    function noise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    }
    
    // 2Dノイズ（より滑らかなノイズ）
    function smoothNoise(x, y) {
        const fx = x / noiseSize;
        const fy = y / noiseSize;
        
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const fx2 = fx - ix;
        const fy2 = fy - iy;
        
        // バイリニア補間
        const n00 = noise(ix, iy);
        const n10 = noise(ix + 1, iy);
        const n01 = noise(ix, iy + 1);
        const n11 = noise(ix + 1, iy + 1);
        
        const nx0 = n00 * (1 - fx2) + n10 * fx2;
        const nx1 = n01 * (1 - fx2) + n11 * fx2;
        
        return nx0 * (1 - fy2) + nx1 * fy2;
    }
    
    const amountValue = amount / 100.0;
    const contrastValue = contrast / 100.0;
    
    // ディスプレイスメントマップを生成
    const displacementMap = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // ノイズから変位量を計算（-1 to 1）
            const noiseValue = smoothNoise(x, y);
            const displacement = (noiseValue - 0.5) * 2; // -1 to 1
            
            // コントラスト調整
            const adjustedDisplacement = displacement * (1 + contrastValue);
            
            // 変位量をスケール
            const dx = adjustedDisplacement * amountValue * noiseSize;
            const dy = adjustedDisplacement * amountValue * noiseSize;
            
            displacementMap.push({ dx, dy });
        }
    }
    
    // ディスプレイスメントを適用
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const { dx, dy } = displacementMap[index];
            
            // 変位後の位置を計算
            const srcX = Math.round(x + dx);
            const srcY = Math.round(y + dy);
            
            // 変位後の位置からピクセルを取得（境界チェック付き）
            const pixel = getPixel(inputData, srcX, srcY);
            
            setPixel(outputData, x, y, pixel.r, pixel.g, pixel.b, pixel.a);
        }
    }
    
    putImageData(outputCanvas, outputData);
    return outputCanvas;
}

// ========== 色パレット階調化フィルター ==========

/**
 * 元画像から色パレットを抽出
 * 元画像の実際の色数のみを返す（色を増やさない）
 */
function extractColorPalette(imageData, maxColors = 512) {
    const colorMap = new Map();
    const width = imageData.width;
    const height = imageData.height;
    const totalPixels = width * height;
    
    // 元画像のすべてのユニークな色を収集（透過ピクセルは除外）
    for (let i = 0; i < totalPixels; i++) {
        const a = imageData.data[i * 4 + 3];
        // 完全に透過しているピクセルはスキップ
        if (a === 0) continue;
        
        const r = imageData.data[i * 4];
        const g = imageData.data[i * 4 + 1];
        const b = imageData.data[i * 4 + 2];
        const colorKey = (r << 16) | (g << 8) | b;
        
        if (!colorMap.has(colorKey)) {
            colorMap.set(colorKey, { r: r, g: g, b: b });
        }
        
        // メモリ保護のため、色数が多すぎる場合は早期終了
        if (colorMap.size >= maxColors * 2) {
            break;
        }
    }
    
    // 元画像の実際の色数のみを返す（量子化で新しい色を作らない）
    const palette = Array.from(colorMap.values());
    
    // 色数が多すぎる場合でも、元画像に存在する色のみを使用
    // 新しい色を生成せず、元画像の実際の色数以下に抑える
    if (palette.length > maxColors) {
        // 元画像の色をそのまま返す（色数が多い場合は制限するが、新しい色は作らない）
        return palette.slice(0, maxColors);
    }
    
    return palette;
}

/**
 * 最も近い色を見つける（輝度を考慮した色距離）
 */
function findNearestColor(targetColor, palette) {
    let minDist = Infinity;
    let nearestColor = palette[0];
    
    // ターゲット色の輝度
    const targetLuma = 0.299 * targetColor.r + 0.587 * targetColor.g + 0.114 * targetColor.b;
    
    for (const color of palette) {
        const dr = targetColor.r - color.r;
        const dg = targetColor.g - color.g;
        const db = targetColor.b - color.b;
        
        // 輝度も考慮した距離計算（等高線効果を減らすため）
        const colorLuma = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
        const lumaDiff = targetLuma - colorLuma;
        
        // 色距離と輝度差を組み合わせ（色距離を重視）
        const colorDist = dr * dr + dg * dg + db * db;
        const lumaDist = lumaDiff * lumaDiff * 0.3; // 輝度差の重みを減らす
        const dist = colorDist + lumaDist;
        
        if (dist < minDist) {
            minDist = dist;
            nearestColor = color;
        }
    }
    
    return nearestColor;
}

/**
 * 色パレット階調化フィルター
 * 元画像の色パレットを使用して、処理後の画像を階調化
 * 等高線効果を減らすため、より滑らかなマッピングを実現
 */
function applyColorPaletteQuantization(inputCanvas, originalImageData) {
    const inputData = getImageData(inputCanvas);
    const width = inputData.width;
    const height = inputData.height;
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputData = outputCanvas.getContext('2d').createImageData(width, height);
    
    // 元画像から色パレットを抽出（より多くの色を保持）
    const palette = extractColorPalette(originalImageData, 512);
    
    if (palette.length === 0) {
        // パレットが空の場合は元の画像を返す
        return inputCanvas;
    }
    
    // パレットを輝度でソート（検索を高速化）
    palette.sort((a, b) => {
        const lumaA = 0.299 * a.r + 0.587 * a.g + 0.114 * a.b;
        const lumaB = 0.299 * b.r + 0.587 * b.g + 0.114 * b.b;
        return lumaA - lumaB;
    });
    
    // 各ピクセルを最も近いパレット色にマッピング
    // パレットに存在する色のみを使用（新しい色を作らない）
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const original = getPixel(inputData, x, y);
            // 最も近いパレット色を見つける（パレットに存在する色のみ）
            const nearest = findNearestColor(original, palette);
            
            // アルファチャンネルを保持し、パレット色を適用
            setPixel(outputData, x, y, nearest.r, nearest.g, nearest.b, original.a);
        }
    }
    
    putImageData(outputCanvas, outputData);
    return outputCanvas;
}

// ========== エクスポート ==========

window.ImageFilters = {
    applyXBRZ,
    applyKuwahara,
    applyRough,
    applyColorPaletteQuantization
};
