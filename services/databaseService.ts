
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
import { Member, APSIndicator, DentalIndicator, TreasuryData, MonthlyBalance } from "../types";

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

export const databaseService = {
  // --- MEMBROS ---
  subscribeMembers: (callback: (members: Member[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "members"), orderBy("registrationDate", "desc"));
    return onSnapshot(q, 
      (snapshot) => callback(snapshot.docs.map(doc => doc.data() as Member)),
      (error) => onError(error)
    );
  },

  saveMember: async (member: Member) => {
    await setDoc(doc(db, "members", member.id), member);
  },

  deleteMember: async (id: string) => {
    await deleteDoc(doc(db, "members", id));
  },

  // --- INDICADORES APS ---
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

  // --- INDICADORES BUCAIS ---
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

  // --- TESOURARIA RESUMO ---
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

  // --- TESOURARIA HISTÓRICO MENSAL ---
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
    await batch.commit();
  },

  // --- LIMPEZA TOTAL ---
  clearDatabase: async (keepUserId: string) => {
    const batch = writeBatch(db);
    
    // Deletar Membros (exceto o admin atual)
    const membersSnap = await getDocs(collection(db, "members"));
    membersSnap.forEach((doc) => {
      if (doc.id !== keepUserId) {
        batch.delete(doc.ref);
      }
    });

    // Deletar Histórico Financeiro
    const historySnap = await getDocs(collection(db, "treasury_history"));
    historySnap.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Resetar Resumo Tesouraria
    const treasuryRef = doc(db, "treasury", "summary");
    batch.set(treasuryRef, {
      id: 'summary',
      totalIn: 0,
      totalOut: 0,
      monthlyFee: 20,
      lastUpdate: new Date().toISOString(),
      updatedBy: 'Sistema (Reset)'
    });

    await batch.commit();
  }
};
