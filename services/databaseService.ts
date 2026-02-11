
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
    const docRef = doc(db, "system_documents", docId);
    await setDoc(docRef, { 
      content: base64Data,
      updatedAt: serverTimestamp()
    });
  },

  deleteDocument: async (docId: string) => {
    const docRef = doc(db, "system_documents", docId);
    await deleteDoc(docRef);
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

  updatePSFRanking: async (psfName: string, data: Partial<PSFRankingData>) => {
    await setDoc(doc(db, "psf_rankings", psfName.replace(/\s+/g, '_')), {
      ...data, psfName, lastUpdate: new Date().toISOString()
    }, { merge: true });
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

  clearDatabase: async (userId: string) => {
    if (userId !== 'admin-01') throw new Error("Acesso negado");
    const batch = writeBatch(db);
    const collections = ["members", "aps_indicators", "dental_indicators", "psf_rankings", "treasury_history", "system_documents"];
    for (const colName of collections) {
      const snap = await getDocs(collection(db, colName));
      snap.forEach(d => batch.delete(d.ref));
    }
    batch.delete(doc(db, "treasury", "summary"));
    batch.delete(doc(db, "system", "stats"));
    await batch.commit();
  },

  seedInitialData: async (aps: APSIndicator[], dental: DentalIndicator[]) => {
    const batch = writeBatch(db);
    aps.forEach(item => batch.set(doc(db, "aps_indicators", item.code), item));
    dental.forEach(item => batch.set(doc(db, "dental_indicators", item.code), item));
    
    // DADOS REAIS ATUALIZADOS PARA AS 5 EQUIPES OFICIAIS
    const officialScores: Record<string, any> = {
      "USF ANTONIO ARNAULD DA SILVA": { 
        eSus: 3307, siaps: 2905,
        esfQ1: 5.75, esfQ1C: 'Bom', esfQ2: 6.0, esfQ2C: 'Bom',
        dQ1: 4.75, dQ1C: 'Suficiente', dQ2: 3.75, dQ2C: 'Suficiente'
      },
      "USF CAROLINA ROSA DE ASSIS": { 
        eSus: 4446, siaps: 3609,
        esfQ1: 5.25, esfQ1C: 'Bom', esfQ2: 6.0, esfQ2C: 'Bom',
        dQ1: 2.5, dQ1C: 'Regular', dQ2: 3.0, dQ2C: 'Suficiente'
      },
      "USF DE CANUDOS": { 
        eSus: 3240, siaps: 1500,
        esfQ1: 6.25, esfQ1C: 'Bom', esfQ2: 5.75, esfQ2C: 'Bom',
        dQ1: 3.5, dQ1C: 'Suficiente', dQ2: 3.0, dQ2C: 'Suficiente'
      },
      "USF DE VARZEA DO CERCO": { 
        eSus: 2704, siaps: 1865,
        esfQ1: 6.75, esfQ1C: 'Bom', esfQ2: 7.25, esfQ2C: 'Bom',
        dQ1: 4.25, dQ1C: 'Suficiente', dQ2: 3.25, dQ2C: 'Suficiente'
      },
      "USF NOEME TELES BOAVENTURA": { 
        eSus: 0, siaps: 0, // Dados populacionais não fornecidos para Noeme
        esfQ1: 6.25, esfQ1C: 'Bom', esfQ2: 7.25, esfQ2C: 'Bom',
        dQ1: 2.5, dQ1C: 'Regular', dQ2: 2.5, dQ2C: 'Regular'
      }
    };

    PSF_LIST.forEach(psf => {
      const data = officialScores[psf] || { esfQ1: 0, esfQ2: 0, dQ1: 0, dQ2: 0, eSus: 0, siaps: 0 };
      batch.set(doc(db, "psf_rankings", psf.replace(/\s+/g, '_')), {
        psfName: psf,
        eSusCount: data.eSus || 0,
        siapsCount: data.siaps || 0,
        esfQ1Score: data.esfQ1 || 0,
        esfQ1Class: data.esfQ1C || 'Regular',
        esfQ2Score: data.esfQ2 || 0,
        esfQ2Class: data.esfQ2C || 'Regular',
        dentalQ1Score: data.dQ1 || 0,
        dentalQ1Class: data.dQ1C || 'Regular',
        dentalQ2Score: data.dQ2 || 0,
        dentalQ2Class: data.dQ2C || 'Regular',
        lastUpdate: new Date().toISOString()
      });
    });
    await batch.commit();
  }
};