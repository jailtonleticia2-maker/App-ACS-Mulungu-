
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
import { Member, APSIndicator, DentalIndicator, TreasuryData, MonthlyBalance, PSFRankingData, PSF_LIST, SystemConfig } from "../types";

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
  // --- CONFIGURAÇÃO DO SISTEMA ---
  subscribeSystemConfig: (callback: (config: SystemConfig) => void) => {
    return onSnapshot(doc(db, "system", "config"), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as SystemConfig);
      } else {
        const initial = { q1Label: 'Q1/25', q2Label: 'Q2/25', q3Label: 'Q3/25' };
        setDoc(doc(db, "system", "config"), initial);
        callback(initial);
      }
    });
  },

  updateSystemConfig: async (config: SystemConfig) => {
    await setDoc(doc(db, "system", "config"), config, { merge: true });
  },

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
    
    // DADOS REAIS EXTRAÍDOS DA IMAGEM FORNECIDA
    const officialTerritorialScores: Record<string, any> = {
      "USF ANTONIO ARNAULD DA SILVA": { 
        tQ1: 10, tQ1C: 'Ótimo', tQ2: 10, tQ2C: 'Ótimo', tQ3: 10, tQ3C: 'Ótimo'
      },
      "USF CAROLINA ROSA DE ASSIS": { 
        tQ1: 10, tQ1C: 'Ótimo', tQ2: 10, tQ2C: 'Ótimo', tQ3: 10, tQ3C: 'Ótimo'
      },
      "USF DE CANUDOS": { 
        tQ1: 3.06, tQ1C: 'Regular', tQ2: 5.19, tQ2C: 'Suficiente', tQ3: 0, tQ3C: 'Regular'
      },
      "USF DE VARZEA DO CERCO": { 
        tQ1: 8.5, tQ1C: 'Bom', tQ2: 10, tQ2C: 'Ótimo', tQ3: 10, tQ3C: 'Ótimo'
      },
      "USF NOEME TELES BOAVENTURA": { 
        tQ1: 10, tQ1C: 'Ótimo', tQ2: 10, tQ2C: 'Ótimo', tQ3: 10, tQ3C: 'Ótimo'
      }
    };

    PSF_LIST.forEach(psf => {
      const data = officialTerritorialScores[psf] || { tQ1: 0, tQ1C: 'Regular', tQ2: 0, tQ2C: 'Regular', tQ3: 0, tQ3C: 'Regular' };
      batch.set(doc(db, "psf_rankings", psf.replace(/\s+/g, '_')), {
        psfName: psf,
        eSusCount: 0,
        siapsCount: 0,
        esfQ1Score: 0, esfQ1Class: 'Regular',
        esfQ2Score: 0, esfQ2Class: 'Regular',
        esfQ3Score: 0, esfQ3Class: 'Regular',
        dentalQ1Score: 0, dentalQ1Class: 'Regular',
        dentalQ2Score: 0, dentalQ2Class: 'Regular',
        dentalQ3Score: 0, dentalQ3Class: 'Regular',
        territorialQ1Score: data.tQ1,
        territorialQ1Class: data.tQ1C,
        territorialQ2Score: data.tQ2,
        territorialQ2Class: data.tQ2C,
        territorialQ3Score: data.tQ3,
        territorialQ3Class: data.tQ3C,
        lastUpdate: new Date().toISOString()
      }, { merge: true });
    });
    await batch.commit();
  }
};