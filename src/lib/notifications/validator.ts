import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

export function validateAndFormatEmail(email: string | null | undefined): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: "L'adresse email est manquante ou vide" };
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: `Format d'adresse email invalide: "${email}"` };
  }

  return { isValid: true, formatted: trimmed.toLowerCase() };
}

export function validateAndFormatPhone(phone: string | null | undefined, defaultCountry: string = 'GN'): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: "Le numéro de téléphone est manquant ou vide" };
  }

  const trimmed = phone.trim();
  
  try {
    // Check if phone starts with '+' (international format) or attempt parsing with default country code (GN for Guinea / West Africa)
    const phoneNumber = parsePhoneNumber(trimmed, trimmed.startsWith('+') ? undefined : (defaultCountry as any));
    
    if (phoneNumber && phoneNumber.isValid()) {
      return {
        isValid: true,
        formatted: phoneNumber.format('E.164') // e.g. +224620000000 or +33612345678
      };
    }
    
    // Fallback E.164 check if standard library is strict
    if (isValidPhoneNumber(trimmed)) {
      return { isValid: true, formatted: trimmed };
    }

    return {
      isValid: false,
      error: `Numéro de téléphone invalide "${phone}". Veuillez utiliser le format international E.164 (ex: +224..., +33..., +225...).`
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Format de numéro non reconnu "${phone}". Exemple attendu: +224XXXXXXX`
    };
  }
}
