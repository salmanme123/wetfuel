import { useCallback, useMemo, useState } from 'react';
import { mockRoyaltyAgreements } from '@/mock';
import type { RoyaltyAgreement } from '@/types';

const STORAGE_KEY = 'wetfuel_royalty_agreements';

function loadCustomAgreements(): RoyaltyAgreement[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as RoyaltyAgreement[]) : [];
  } catch {
    return [];
  }
}

export function useRoyaltyAgreements() {
  const [customAgreements, setCustomAgreements] = useState<RoyaltyAgreement[]>(loadCustomAgreements);

  const agreements = useMemo(
    () => [...mockRoyaltyAgreements, ...customAgreements],
    [customAgreements],
  );

  const addAgreement = useCallback((agreement: RoyaltyAgreement) => {
    setCustomAgreements((prev) => {
      const next = [...prev, agreement];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { agreements, addAgreement };
}
