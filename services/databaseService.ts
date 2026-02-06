
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
  getDocs,
  increment,
  updateDoc,
  getDoc,
  serverTimestamp,
  deleteField
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

const STATUS_POINTS: Record<string, number> = {
  'Ótimo': 4,
  'Bom': 3,
  'Regular': 2,
  'Suficiente': 1
};

export const databaseService = {
  // --- MONITORAMENTO ---
  updateHeartbeat: async (memberId: string, isOnline: boolean) => {
    if (!memberId || memberId === 'guest') return;
    try {
      const memberRef = doc(db, "members", memberId);
      await updateDoc(memberRef, { 
        isOnline: isOnline,
        lastSeen: new Date().toISOString()
      });
    } catch (e) {
      console.error("Erro heartbeat:", e);
    }
  },

  setMemberOnlineStatus: async (memberId: string, status: boolean) => {
    if (!memberId || memberId === 'guest') return;
    try {
      const memberRef = doc(db, "members", memberId);
      await updateDoc(memberRef, { 
        isOnline: status,
        lastSeen: new Date().toISOString()
      });
    } catch (e) {
      console.error("Erro status:", e);
    }
  },

  incrementDailyAccess: async (memberId: string) => {
    if (!memberId || memberId === 'guest') return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const memberRef = doc(db, "members", memberId);
      const snap = await getDoc(memberRef);
      if (snap.exists()) {
        const data = snap.data() as Member;
        if (data.lastDailyReset !== today) {
          await updateDoc(memberRef, { 
            dailyAccessCount: 1, 
            lastDailyReset: today,
            accessCount: increment(1),
            lastSeen: new Date().toISOString()
          });
        } else {
          await updateDoc(memberRef, { 
            dailyAccessCount: increment(1),
            accessCount: increment(1),
            lastSeen: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error("Erro acesso:", e);
    }
  },

  incrementAccessCount: async () => {
    try {
      const statsRef = doc(db, "system", "stats");
      await updateDoc(statsRef, { accessCount: increment(1) });
    } catch (e) {
      const statsRef = doc(db, "system", "stats");
      await setDoc(statsRef, { accessCount: 1 }, { merge: true });
    }
  },

  subscribeSystemStats: (callback: (stats: { accessCount: number }) => void) => {
    return onSnapshot(doc(db, "system", "stats"), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as { accessCount: number });
      } else {
        callback({ accessCount: 0 });
      }
    });
  },

  // --- DOCUMENTOS ---
  subscribeDocuments: (callback: (docs: Record<string, string>) => void) => {
    return onSnapshot(collection(db, "system_documents"), (snapshot) => {
      const docs: Record<string, string> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.content) docs[docSnap.id] = data.content;
      });
      callback(docs);
    });
  },

  saveDocument: async (docId: string, base64Data: string) => {
    if (base64Data.length > 1048487) {
      throw new Error("Arquivo muito grande (Limite 1MB). Use o site iLovePDF para comprimir.");
    }
    const docRef = doc(db, "system_documents", docId);
    await setDoc(docRef, { 
      content: base64Data,
      updatedAt: serverTimestamp()
    });
  },

  deleteDocument: async (docId: string) => {
    const docRef = doc(db, "system_documents", docId);
    await deleteDoc(docRef);
    const legacyRef = doc(db, "system", "documents");
    try {
      await updateDoc(legacyRef, { [docId]: deleteField() });
    } catch (e) {}
  },

  // --- MEMBROS ---
  subscribeMembers: (callback: (members: Member[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "members"), orderBy("registrationDate", "desc"));
    return onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(d => ({ ...d.data() as Member, id: d.id }));
      callback(members);
    }, (error) => onError(error));
  },

  saveMember: async (member: Member) => {
    if (!member.id) throw new Error("ID obrigatório");
    const memberRef = doc(db, "members", member.id);
    await setDoc(memberRef, cleanData(member), { merge: true });
  },

  deleteMember: async (id: string) => {
    await deleteDoc(doc(db, "members", id));
  },

  // --- INDICADORES ---
  subscribeAPS: (callback: (indicators: APSIndicator[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "aps_indicators"), orderBy("code", "asc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => d.data() as APSIndicator));
    }, (error) => onError(error));
  },

  updateAPS: async (indicator: APSIndicator) => {
    await setDoc(doc(db, "aps_indicators", indicator.code), indicator);
  },

  subscribePSFRankings: (callback: (rankings: PSFRankingData[]) => void) => {
    return onSnapshot(collection(db, "psf_rankings"), (snapshot) => {
      callback(snapshot.docs.map(d => d.data() as PSFRankingData));
    });
  },

  updatePSFRanking: async (psfName: string, indicators: APSIndicator[]) => {
    const totalScore = indicators.reduce((acc, curr) => acc + (STATUS_POINTS[curr.status] || 0), 0);
    await setDoc(doc(db, "psf_rankings", psfName.replace(/\s+/g, '_')), {
      psfName, indicators, totalScore, lastUpdate: new Date().toISOString()
    });
  },

  subscribeDental: (callback: (indicators: DentalIndicator[]) => void, onError: (err: any) => void) => {
    const q = query(collection(db, "dental_indicators"), orderBy("code", "asc"));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => d.data() as DentalIndicator));
    }, (error) => onError(error));
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
          id: 'summary', totalIn: 0, totalOut: 0, monthlyFee: 20, lastUpdate: new Date().toISOString(), updatedBy: 'Sistema'
        };
        setDoc(doc(db, "treasury", "summary"), initial);
        callback(initial);
      }
    });
  },

  updateTreasury: async (data: TreasuryData) => {
    await setDoc(doc(db, "treasury", "summary"), { ...data, lastUpdate: new Date().toISOString() });
  },

  subscribeMonthlyHistory: (year: number, callback: (balances: MonthlyBalance[]) => void) => {
    const q = query(collection(db, "treasury_history"), where("year", "==", year));
    return onSnapshot(q, (snapshot) => {
      const balances = snapshot.docs.map(d => d.data() as MonthlyBalance);
      balances.sort((a, b) => b.month - a.month);
      callback(balances);
    });
  },

  saveMonthlyBalance: async (balance: MonthlyBalance) => {
    await setDoc(doc(db, "treasury_history", balance.id), { ...balance, updatedAt: new Date().toISOString() });
  },

  deleteMonthlyBalance: async (id: string) => { 
    await deleteDoc(doc(db, "treasury_history", id)); 
  },

  seedInitialData: async (aps: APSIndicator[], dental: DentalIndicator[]) => {
    const batch = writeBatch(db);
    aps.forEach(item => batch.set(doc(db, "aps_indicators", item.code), item));
    dental.forEach(item => batch.set(doc(db, "dental_indicators", item.code), item));
    
    const officialResults: Record<string, string[]> = {
      "PSF ARNOLD": ["56.73%", "37.14%", "58.56%", "63.58%", "64.83%", "56.63%", "42.82%"],
      "PSF VARZEA": ["42.73%", "42.86%", "67.40%", "65.59%", "64.02%", "60.16%", "52.71%"],
      "PSF CANUDOS": ["59.07%", "18.00%", "33.67%", "52.46%", "64.60%", "48.73%", "41.55%"],
      "PSF CAROLINA": ["57.16%", "48.24%", "72.90%", "50.11%", "67.76%", "57.91%", "36.90%"],
      "PSF NOEME TELES": ["61.11%", "53.33%", "61.50%", "58.33%", "70.92%", "52.91%", "47.27%"]
    };

    PSF_LIST.forEach(psf => {
      const results = officialResults[psf] || ["0%", "0%", "0%", "0%", "0%", "0%", "0%"];
      const unitIndicators = aps.map((a, i) => {
        const val = parseFloat(results[i].replace('%', ''));
        let st: any = 'Regular';
        if (a.code === 'C1') st = val > 50 ? 'Ótimo' : val > 30 ? 'Bom' : 'Suficiente';
        else st = val > 75 ? 'Ótimo' : val > 50 ? 'Bom' : val > 25 ? 'Regular' : 'Suficiente';
        return { ...a, cityValue: results[i], status: st };
      });
      const totalScore = unitIndicators.reduce((acc, curr) => acc + (STATUS_POINTS[curr.status] || 0), 0);
      batch.set(doc(db, "psf_rankings", psf.replace(/\s+/g, '_')), {
        psfName: psf, indicators: unitIndicators, totalScore, lastUpdate: new Date().toISOString()
      });
    });
    await batch.commit();
  },

  clearDatabase: async (keepUserId: string) => {
    const batch = writeBatch(db);
    const membersSnap = await getDocs(collection(db, "members"));
    membersSnap.forEach((d) => { if (d.id !== keepUserId) batch.delete(d.ref); });
    const historySnap = await getDocs(collection(db, "treasury_history"));
    historySnap.forEach((d) => batch.delete(d.ref));
    const treasuryRef = doc(db, "treasury", "summary");
    batch.set(treasuryRef, {
      id: 'summary', totalIn: 0, totalOut: 0, monthlyFee: 20, lastUpdate: new Date().toISOString(), updatedBy: 'Reset'
    });
    await batch.commit();
  }
};
