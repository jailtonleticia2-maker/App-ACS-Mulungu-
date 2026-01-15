
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  writeBatch,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Member, APSIndicator, DentalIndicator, TreasuryData, MonthlyBalance, PSFRankingData, PSF_LIST } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyDIS91OFlTIzbq44YCAAn95BAzGW5A-KBw",
  authDomain: "acs-mulungu.firebaseapp.com",
  projectId: "acs-mulungu",
  storageBucket: "acs-mulungu.firebasestorage.app",
  messagingSenderId: "390767593306",
  appId: "1:390767593306:web:2a06306d7e560f6c3e9563"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cleanData = (obj: any) => {
  const clean: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean;
};

export const databaseService = {
  // --- MEMBROS ---
  subscribeMembers: (callback: (members: Member[]) => void, onError: (err: any) => void) => {
    try {
      const q = query(collection(db, "members"), orderBy("registrationDate", "desc"));
      return onSnapshot(q, 
        (snapshot) => {
          const members = snapshot.docs.map(doc => ({ ...doc.data() as Member, id: doc.id }));
          callback(members);
        },
        (error) => {
          console.error("Erro no Snapshot de Membros:", error);
          onError(error);
        }
      );
    } catch (err) {
      console.error("Erro ao assinar membros:", err);
      return () => {};
    }
  },

  saveMember: async (member: Member) => {
    if (!member.id) throw new Error("ID do membro é obrigatório para salvar.");
    const memberRef = doc(db, "members", member.id);
    const dataToSave = cleanData(member);
    await setDoc(memberRef, dataToSave, { merge: true });
  },

  deleteMember: async (id: string) => {
    if (!id) throw new Error("ID é obrigatório para exclusão.");
    const memberRef = doc(db, "members", id);
    await deleteDoc(memberRef);
  },

  // --- INDICADORES ---
  subscribeAPS: (callback: (indicators: APSIndicator[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "aps_indicators"), orderBy("code", "asc"));
    return onSnapshot(q, 
      (snapshot) => callback(snapshot.docs.map(doc => doc.data() as APSIndicator)),
      (error) => onError(error)
    );
  },

  updateAPS: async (indicator: APSIndicator) => {
    await setDoc(doc(db, "aps_indicators", indicator.code), indicator);
  },

  // --- RANKING PSF ---
  subscribePSFRankings: (callback: (rankings: PSFRankingData[]) => void) => {
    return onSnapshot(collection(db, "psf_rankings"), (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as PSFRankingData));
    });
  },

  updatePSFRanking: async (psfName: string, indicators: APSIndicator[]) => {
    const scoreMap: Record<string, number> = { 'Ótimo': 4, 'Bom': 3, 'Suficiente': 2, 'Regular': 1 };
    const totalScore = indicators.reduce((acc, curr) => acc + (scoreMap[curr.status] || 0), 0);
    
    await setDoc(doc(db, "psf_rankings", psfName.replace(/\s+/g, '_')), {
      psfName,
      indicators,
      totalScore,
      lastUpdate: new Date().toISOString()
    });
  },

  subscribeDental: (callback: (indicators: DentalIndicator[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "dental_indicators"), orderBy("code", "asc"));
    return onSnapshot(q, 
      (snapshot) => callback(snapshot.docs.map(doc => doc.data() as DentalIndicator)),
      (error) => onError(error)
    );
  },

  updateDental: async (indicator: DentalIndicator) => {
    await setDoc(doc(db, "dental_indicators", indicator.code), indicator);
  },

  // --- TESOURARIA ---
  subscribeTreasury: (callback: (data: TreasuryData) => void) => {
    return onSnapshot(doc(db, "treasury", "summary"), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as TreasuryData);
      } else {
        const initial: TreasuryData = {
          id: 'summary',
          totalIn: 0,
          totalOut: 0,
          monthlyFee: 20,
          lastUpdate: new Date().toISOString(),
          updatedBy: 'Sistema'
        };
        setDoc(doc(db, "treasury", "summary"), initial);
        callback(initial);
      }
    });
  },

  updateTreasury: async (data: TreasuryData) => {
    await setDoc(doc(db, "treasury", "summary"), {
      ...data,
      lastUpdate: new Date().toISOString()
    });
  },

  subscribeMonthlyHistory: (year: number, callback: (balances: MonthlyBalance[]) => void) => {
    const q = query(
      collection(db, "treasury_history"), 
      where("year", "==", year)
    );
    return onSnapshot(q, (snapshot) => {
      const balances = snapshot.docs.map(doc => doc.data() as MonthlyBalance);
      balances.sort((a, b) => b.month - a.month);
      callback(balances);
    });
  },

  saveMonthlyBalance: async (balance: MonthlyBalance) => {
    await setDoc(doc(db, "treasury_history", balance.id), {
      ...balance,
      updatedAt: new Date().toISOString()
    });
  },

  deleteMonthlyBalance: async (id: string) => {
    await deleteDoc(doc(db, "treasury_history", id));
  },

  seedInitialData: async (aps: APSIndicator[], dental: DentalIndicator[]) => {
    const batch = writeBatch(db);
    aps.forEach(item => batch.set(doc(db, "aps_indicators", item.code), item));
    dental.forEach(item => batch.set(doc(db, "dental_indicators", item.code), item));
    
    // Seed inicial para o ranking de cada PSF
    PSF_LIST.forEach(psf => {
      batch.set(doc(db, "psf_rankings", psf.replace(/\s+/g, '_')), {
        psfName: psf,
        indicators: aps.map(a => ({ ...a, status: 'Suficiente', cityValue: '0%' })),
        totalScore: aps.length * 2,
        lastUpdate: new Date().toISOString()
      });
    });

    await batch.commit();
  },

  clearDatabase: async (keepUserId: string) => {
    const batch = writeBatch(db);
    const membersSnap = await getDocs(collection(db, "members"));
    membersSnap.forEach((doc) => {
      if (doc.id !== keepUserId) {
        batch.delete(doc.ref);
      }
    });
    const historySnap = await getDocs(collection(db, "treasury_history"));
    historySnap.forEach((doc) => {
      batch.delete(doc.ref);
    });
    const treasuryRef = doc(db, "treasury", "summary");
    batch.set(treasuryRef, {
      id: 'summary', totalIn: 0, totalOut: 0, monthlyFee: 20,
      lastUpdate: new Date().toISOString(), updatedBy: 'Sistema (Reset)'
    });
    await batch.commit();
  }
};