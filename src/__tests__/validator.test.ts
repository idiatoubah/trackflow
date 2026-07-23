import { describe, it, expect } from 'vitest';
import { validateAndFormatEmail, validateAndFormatPhone } from '../lib/notifications/validator';

describe('Validator - Email & Format International E.164', () => {
  describe('Email Validation', () => {
    it('doit valider et nettoyer une adresse email correcte', () => {
      const res = validateAndFormatEmail('  USER@TRACKFLOW.COM  ');
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe('user@trackflow.com');
    });

    it('doit rejeter une adresse email invalide', () => {
      const res = validateAndFormatEmail('email-invalide.com');
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('E.164 Phone Validation', () => {
    it('doit valider et formater un numéro international au format E.164 (Guinée +224)', () => {
      const res = validateAndFormatPhone('+224620000000');
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe('+224620000000');
    });

    it('doit valider et formater un numéro international au format E.164 (France +33)', () => {
      const res = validateAndFormatPhone('+33612345678');
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe('+33612345678');
    });

    it('doit ajouter le préfixe E.164 pour un numéro local selon le pays par défaut', () => {
      const res = validateAndFormatPhone('620000000', 'GN');
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe('+224620000000');
    });

    it('doit rejeter un numéro de téléphone totalement invalide', () => {
      const res = validateAndFormatPhone('123');
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });
});
