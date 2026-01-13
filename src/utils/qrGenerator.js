// backend/src/utils/qrGenerator.js
import QRCode from 'qrcode';

/**
 * Genera un código QR para un producto
 * @param {string} data - Datos a codificar en el QR
 * @param {object} options - Opciones para el QR
 * @returns {Promise<string>} - Data URL del QR (base64)
 */
export async function generateQRCode(data, options = {}) {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    const qrDataURL = await QRCode.toDataURL(data, defaultOptions);
    return qrDataURL;
  } catch (error) {
    console.error('Error generando QR:', error);
    throw new Error('Error al generar código QR');
  }
}

/**
 * Genera un ID único para productos basado en timestamp y random
 * @returns {string} - ID único
 */
export function generateProductId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `PROD-${timestamp}-${random}`.toUpperCase();
}