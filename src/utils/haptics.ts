/**
 * Haptic feedback utility for mobile devices
 * Provides tactile vibration feedback on administrative actions and key interactions
 */

export const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors on unsupported hardware or browsers
    }
  }
};

/** Vibración al acceder o abrir el Panel de Administrador */
export const triggerAdminAccessHaptic = () => {
  triggerHaptic([70, 50, 90]);
};

/** Vibración al desbloquear con éxito la contraseña */
export const triggerAdminUnlockSuccessHaptic = () => {
  triggerHaptic([80, 40, 120]);
};

/** Vibración de error al fallar la contraseña */
export const triggerAdminErrorHaptic = () => {
  triggerHaptic([180, 80, 180]);
};

/** Vibración sutil al pulsar botones de opciones administrativas */
export const triggerAdminActionHaptic = () => {
  triggerHaptic(50);
};
