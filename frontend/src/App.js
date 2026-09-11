import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import CommunityDashboard from "./CommunityDashboard";
import { saveScanToFirebase, listenToCommunityScams } from "./communityService";

const TEXT = {
  en: {
    logoPill: "🛡️ PhishGuard",
    heading: "Is this message a",
    headingAccent: "scam?",
    subtitle: "AI reads and explains exactly why a message is dangerous — in plain words.",
    tabScan: "🔍 Scan",
    tabInbox: "📱 Inbox",
    tabCommunity: "🌐 Community",
    tabHistory: "📋 History",
    tabContacts: "👨‍👩‍👧 Contacts",
    inboxNote: "⚡ Messages scanned automatically in real-time",
    inboxTap: "Tap any message to see full AI analysis",
    pasteLabel: "PASTE YOUR MESSAGE",
    placeholder: "Paste any SMS, email or WhatsApp message here...",
    tryLabel: "Try:",
    chips: { kyc: "KYC Scam", lottery: "Lottery Fraud", safe: "Safe Message", otp: "OTP Fraud" },
    scanBtn: "🤔 I Am Not Sure About This",
    pasteBtn: "📋 Paste & Scan Copied Message",
    scanningBtn: "⏳ Checking with AI...",
    aiLabel: "🤖 AI EXPLANATION",
    readAloud: "🔊 Read Aloud",
    stop: "⏹ Stop",
    riskScore: "Risk Score",
    noFlags: "✓ No red flags",
    alertBtn: "📞 Alert My Family Member on WhatsApp",
    suspiciousLinks: "⚠️ Suspicious links found:",
    alertFamily: "🚨 Alert Family",
    safe: "✅ This Looks Safe",
    medium: "⚠️ Be Careful!",
    danger: "🚨 DANGER — This is a SCAM!",
    modalTitle: "📞 Send WhatsApp Alert",
    modalSubtitle: "Enter your family member's phone number",
    modalPlaceholder: "Enter number (e.g. 9876543210)",
    modalNote: "India number without +91 prefix (we'll add it automatically)",
    cancel: "Cancel",
    send: "Send on WhatsApp 🚀",
    scam: "🚨 SCAM",
    safeTag: "✅ SAFE",
    savedContacts: "👨‍👩‍👧 Saved Family Contacts",
    contactName: "Name (e.g. Son, Daughter)",
    contactNumber: "Phone Number",
    saveContact: "Save Contact",
    noContacts: "No contacts saved yet",
    deleteContact: "Remove",
    quickAlert: "🚨 Quick Alert",
    contactSaved: "Contact saved!",
    historyTitle: "📋 Scan History",
    historyEmpty: "No scans yet. Scan a message to see history here.",
    historyClear: "🗑️ Clear History",
    historyTotal: "Total Scans",
    historyDanger: "🚨 Scams Found",
    historySafe: "✅ Safe Messages",
    datasetUsed: "✅ Dataset matched",
    datasetNotUsed: "ℹ️ No dataset match",
    explainIn: "Explanation in:",
    enterFamily: "Enter family member's WhatsApp number",
  },
  hi: {
    logoPill: "🛡️ फिशगार्ड",
    heading: "क्या यह संदेश",
    headingAccent: "धोखाधड़ी है?",
    subtitle: "AI बताएगा कि यह संदेश खतरनाक क्यों है — सरल भाषा में।",
    tabScan: "🔍 जांचें",
    tabInbox: "📱 इनबॉक्स",
    tabCommunity: "🌐 समुदाय",
    tabHistory: "📋 इतिहास",
    tabContacts: "👨‍👩‍👧 संपर्क",
    inboxNote: "⚡ संदेश स्वचालित रूप से रियल-टाइम में स्कैन किए जाते हैं",
    inboxTap: "पूरी AI जानकारी के लिए किसी भी संदेश पर टैप करें",
    pasteLabel: "अपना संदेश यहाँ पेस्ट करें",
    placeholder: "कोई भी SMS, ईमेल या WhatsApp संदेश यहाँ पेस्ट करें...",
    tryLabel: "उदाहरण:",
    chips: { kyc: "KYC धोखा", lottery: "लॉटरी फ्रॉड", safe: "सुरक्षित संदेश", otp: "OTP धोखा" },
    scanBtn: "🤔 मुझे यह संदेश संदिग्ध लग रहा है",
    pasteBtn: "📋 कॉपी किया हुआ संदेश स्कैन करें",
    scanningBtn: "⏳ AI से जांच हो रही है...",
    aiLabel: "🤖 AI विश्लेषण",
    readAloud: "🔊 ज़ोर से पढ़ें",
    stop: "⏹ रोकें",
    riskScore: "जोखिम स्कोर",
    noFlags: "✓ कोई संदिग्ध बात नहीं",
    alertBtn: "📞 परिवार के सदस्य को WhatsApp अलर्ट भेजें",
    suspiciousLinks: "⚠️ संदिग्ध लिंक मिले:",
    alertFamily: "🚨 परिवार को अलर्ट करें",
    safe: "✅ यह संदेश सुरक्षित लगता है",
    medium: "⚠️ सावधान रहें!",
    danger: "🚨 खतरा — यह धोखाधड़ी है!",
    modalTitle: "📞 WhatsApp अलर्ट भेजें",
    modalSubtitle: "परिवार के सदस्य का फोन नंबर दर्ज करें",
    modalPlaceholder: "नंबर दर्ज करें (जैसे 9876543210)",
    modalNote: "+91 के बिना नंबर दर्ज करें (हम अपने आप जोड़ देंगे)",
    cancel: "रद्द करें",
    send: "WhatsApp पर भेजें 🚀",
    scam: "🚨 धोखा",
    safeTag: "✅ सुरक्षित",
    savedContacts: "👨‍👩‍👧 सहेजे गए परिवार के संपर्क",
    contactName: "नाम (जैसे बेटा, बेटी)",
    contactNumber: "फोन नंबर",
    saveContact: "संपर्क सहेजें",
    noContacts: "अभी कोई संपर्क सहेजा नहीं है",
    deleteContact: "हटाएं",
    quickAlert: "🚨 अलर्ट भेजें",
    contactSaved: "संपर्क सहेज लिया!",
    historyTitle: "📋 स्कैन इतिहास",
    historyEmpty: "अभी कोई स्कैन नहीं। इतिहास देखने के लिए कोई संदेश स्कैन करें।",
    historyClear: "🗑️ इतिहास साफ करें",
    historyTotal: "कुल स्कैन",
    historyDanger: "🚨 धोखे मिले",
    historySafe: "✅ सुरक्षित संदेश",
    datasetUsed: "✅ डेटासेट मिलान",
    datasetNotUsed: "ℹ️ कोई मिलान नहीं",
    explainIn: "भाषा चुनें:",
    enterFamily: "परिवार के सदस्य का WhatsApp नंबर दर्ज करें",
  }
};

const EXAMPLES = {
  kyc: "URGENT: Dear Customer, Your SBI account KYC has expired. Your account will be blocked in 24 hours. Click here to update: bit.ly/sbi-kyc and enter your Aadhar and PAN details immediately.",
  lottery: "Congratulations! You won Rs 25,00,000 in Government lottery. Call 9876543210 and share your bank account details to claim prize money.",
  safe: "Hi, this is Priya from your daughter school. Parent teacher meeting is on Saturday 10am. Please confirm attendance.",
  otp: "Your OTP for HDFC Bank transaction of Rs 15,000 is 847362. NEVER share this OTP with anyone including bank officials."
};

const mockMessages = [
  { id: 1, from: "SBI Bank Alert", fromHi: "SBI बैंक अलर्ट", preview: "URGENT: Your KYC has expired...", previewHi: "जरूरी: आपका KYC समाप्त हो गया है...", full: "URGENT: Dear Customer, Your SBI account KYC has expired. Click here: bit.ly/sbi-kyc", time: "10:23 AM", scanned: "danger" },
  { id: 2, from: "Mom", fromHi: "माँ", preview: "Hi beta, are you coming home...", previewHi: "हाँ बेटा, क्या तुम घर आ रहे हो...", full: "Hi beta, are you coming home for dinner today? Let me know.", time: "11:45 AM", scanned: "safe" },
  { id: 3, from: "HDFC Bank", fromHi: "HDFC बैंक", preview: "Congratulations! You won Rs 25 lakhs...", previewHi: "बधाई! आपने 25 लाख जीते...", full: "Congratulations! You won Rs 25,00,000 in lottery. Call 9876543210 to claim.", time: "12:10 PM", scanned: "danger" },
  { id: 4, from: "Priya School", fromHi: "प्रिया स्कूल", preview: "Parent teacher meeting Saturday...", previewHi: "अभिभावक शिक्षक बैठक शनिवार को...", full: "Parent teacher meeting is on Saturday 10am. Please confirm attendance.", time: "1:30 PM", scanned: "safe" }
];

const loadContacts = () => {
  try { return JSON.parse(localStorage.getItem("phishguard_contacts") || "[]"); }
  catch { return []; }
};

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem("phishguard_history") || "[]"); }
  catch { return []; }
};

export default function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("scanner");
  const [speaking, setSpeaking] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [familyNumber, setFamilyNumber] = useState("");
  const [pendingAlertLink, setPendingAlertLink] = useState("");
  const [contacts, setContacts] = useState(loadContacts);
  const [newContactName, setNewContactName] = useState("");
  const [newContactNumber, setNewContactNumber] = useState("");
  const [history, setHistory] = useState(loadHistory);
  const [communityAlert, setCommunityAlert] = useState(null);

  const fullExplanationRef = useRef("");
  const t = TEXT[lang];
  

// ✅ ADD THIS AFTER
useEffect(() => {
  let isFirst = true;
  const unsubscribe = listenToCommunityScams((scams) => {
    if (isFirst) { isFirst = false; return; }
    if (scams.length > 0) {
      const latest = scams[0];
      setCommunityAlert(latest);
      setTimeout(() => setCommunityAlert(null), 5000);
    }
  });
  return () => unsubscribe();
}, []);

  // ── Helpers ──────────────────────────────────────────────
  const getLinks = (text) =>
    text.match(/https?:\/\/\S+|bit\.ly\/\S+|tinyurl\.com\/\S+/g) || [];

  function typeText(text, setter) {
    if (!text) return;
    let i = 0;
    setter("");
    const timer = setInterval(() => {
      if (i < text.length) {
        const char = text[i]; i++;
        setter(prev => prev + char);
      } else { clearInterval(timer); }
    }, 15);
  }

  // ── History ───────────────────────────────────────────────
  const saveToHistory = (msgText, scanResult, explanation) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      message_preview: msgText.substring(0, 80) + (msgText.length > 80 ? "..." : ""),
      risk_level: scanResult.risk_level,
      risk_score: scanResult.risk_score,
      triggered_flags: scanResult.triggered_flags || [],
      explanation,
      dataset_used: scanResult.dataset_used || false,
      similar_scams_found: scanResult.similar_scams_found || 0
    };
    const updated = [newEntry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("phishguard_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (window.confirm(lang === "hi" ? "क्या आप इतिहास साफ करना चाहते हैं?" : "Clear all scan history?")) {
      setHistory([]);
      localStorage.removeItem("phishguard_history");
    }
  };

  // ── Contacts ──────────────────────────────────────────────
  const saveContact = () => {
    const number = newContactNumber.replace(/\D/g, "");
    if (!newContactName.trim() || number.length < 10) {
      alert(lang === "hi" ? "कृपया सही नाम और नंबर दर्ज करें" : "Please enter valid name and number");
      return;
    }
    const newContact = {
      id: Date.now(),
      name: newContactName.trim(),
      number: number.startsWith("91") ? number : "91" + number
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem("phishguard_contacts", JSON.stringify(updated));
    setNewContactName("");
    setNewContactNumber("");
    alert(t.contactSaved);
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem("phishguard_contacts", JSON.stringify(updated));
  };

  const quickAlert = (contact) => {
    const alertMsg = lang === "hi"
      ? `🚨 *फिशगार्ड अलर्ट!*\n\nएक संदिग्ध संदेश मिला है।\n\n⚠️ यह धोखाधड़ी हो सकती है। कृपया तुरंत जांच करें।\n\n_फिशगार्ड द्वारा भेजा गया 🛡️_`
      : `🚨 *PHISHGUARD ALERT!*\n\nA suspicious scam message was detected.\n\n⚠️ This may be a SCAM. Please check immediately.\n\n_Sent by PhishGuard 🛡️_`;
    window.open(`https://wa.me/${contact.number}?text=${encodeURIComponent(alertMsg)}`, "_blank");
  };

  // ── Scan ──────────────────────────────────────────────────
  const runScan = async (textToScan) => {
    setLoading(true);
    setResult(null);
    setAiText("");
    fullExplanationRef.current = "";
    try {
      const res = await axios.post("https://phishguard-app-0mrx.onrender.com/api/scan", { text: textToScan, lang });
      const raw = res.data.explanation;
      const clean = (raw === undefined || raw === null)
        ? "Analysis complete."
        : String(raw).replace(/undefined/g, "").trim();
      fullExplanationRef.current = clean;
      setResult(res.data);
      typeText(clean, setAiText);
      saveToHistory(textToScan, res.data, clean);
      // Save to Firebase community
      saveScanToFirebase({ ...res.data, message: textToScan });
    } catch (err) {
      alert(lang === "hi" ? "त्रुटि! क्या बैकएंड चल रहा है?" : "Error! Is backend running?");
    }
    setLoading(false);
  };

  const scanMessage = async () => {
    if (!message.trim()) return;
    await runScan(message);
  };

  // ── Smart Paste & Scan ────────────────────────────────────
  const pasteAndScan = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || text.trim() === "") {
        alert(lang === "hi" ? "क्लिपबोर्ड खाली है!" : "Clipboard is empty! Copy a message first");
        return;
      }
      setMessage(text.trim());
      await runScan(text.trim());
    } catch (err) {
      alert(lang === "hi" ? "क्लिपबोर्ड access नहीं मिली। Chrome में try करें" : "Clipboard access denied. Please try in Chrome");
    }
  };

  // ── TTS ───────────────────────────────────────────────────
  const speakText = () => {
    const textToSpeak = fullExplanationRef.current;
    if (!textToSpeak || textToSpeak.trim() === "") {
      alert(lang === "hi" ? "कृपया पहले संदेश स्कैन करें" : "Please scan a message first");
      return;
    }
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.85; utterance.pitch = 1; utterance.volume = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    if (lang === "hi") {
      utterance.lang = "hi-IN";
      const trySpeak = (voices) => {
        const hindiVoice = voices.find(v => v.lang === "hi-IN" || v.lang.startsWith("hi"));
        if (hindiVoice) utterance.voice = hindiVoice;
        setTimeout(() => window.speechSynthesis.speak(utterance), 100);
      };
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) trySpeak(voices);
      else window.speechSynthesis.onvoiceschanged = () => {
        trySpeak(window.speechSynthesis.getVoices());
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      utterance.lang = "en-IN";
      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
    }
  };

  // ── WhatsApp Alert ────────────────────────────────────────
  const openFamilyAlert = (link) => { setPendingAlertLink(link); setShowWhatsAppModal(true); };

  const sendFamilyAlert = () => {
    const number = familyNumber.replace(/\D/g, "");
    if (!number || number.length < 10) {
      alert(lang === "hi" ? "कृपया सही फोन नंबर दर्ज करें" : "Please enter a valid phone number");
      return;
    }
    const fullNumber = number.startsWith("91") ? number : "91" + number;
    const alertMsg = lang === "hi"
      ? `🚨 *फिशगार्ड अलर्ट!*\n\nसंदिग्ध संदेश मिला है।\n\n⚠️ यह धोखाधड़ी हो सकती है।\n\n_फिशगार्ड 🛡️_`
      : `🚨 *PHISHGUARD ALERT!*\n\nSuspicious scam message detected.\n\n⚠️ This may be a SCAM. Please check immediately.\n\n_Sent by PhishGuard 🛡️_`;
    window.open(`https://wa.me/${fullNumber}?text=${encodeURIComponent(alertMsg)}`, "_blank");
    setShowWhatsAppModal(false);
    setFamilyNumber("");
  };

  // ── Colors ────────────────────────────────────────────────
  const colors = {
    safe: { bg: "#00e5a015", border: "#00e5a0", text: "#00e5a0", label: t.safe },
    medium: { bg: "#ffb80015", border: "#ffb800", text: "#ffb800", label: t.medium },
    danger: { bg: "#ff3a5c15", border: "#ff3a5c", text: "#ff3a5c", label: t.danger }
  };
  const historyColors = { danger: "#ff3a5c", medium: "#ffb800", safe: "#00e5a0" };
  const c = result ? colors[result.risk_level] : null;

  const totalScans = history.length;
  const dangerScans = history.filter(h => h.risk_level === "danger").length;
  const safeScans = totalScans - dangerScans;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ✅ Real Time Community Alert Popup */}
{communityAlert && (
  <div style={styles.communityPopup}>
    <div style={styles.popupLeft}>
      <span style={{ fontSize: 20 }}>🚨</span>
      <div>
        <div style={styles.popupTitle}>
          New {communityAlert.scam_type} detected in community!
        </div>
        <div style={styles.popupSub}>
          {communityAlert.message_preview}
        </div>
      </div>
    </div>
    <button
      style={styles.popupClose}
      onClick={() => setCommunityAlert(null)}
    >
      ✕
    </button>
  </div>
)}
      <div style={styles.container}>

        {/* Language Toggle */}
        <div style={styles.topLangRow}>
          <button style={{ ...styles.topLangBtn, ...(lang === "en" ? styles.topLangActive : {}) }}
            onClick={() => { setLang("en"); window.speechSynthesis.cancel(); setSpeaking(false); }}>
            🇬🇧 English
          </button>
          <button style={{ ...styles.topLangBtn, ...(lang === "hi" ? styles.topLangActive : {}) }}
            onClick={() => { setLang("hi"); window.speechSynthesis.cancel(); setSpeaking(false); }}>
            🇮🇳 हिंदी
          </button>
        </div>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoPill}>{t.logoPill}</div>
          <h1 style={styles.h1}>{t.heading}{" "}<span style={styles.accent}>{t.headingAccent}</span></h1>
          <p style={styles.subtitle}>{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          <button style={{ ...styles.tab, ...(activeTab === "scanner" ? styles.tabActive : {}) }} onClick={() => setActiveTab("scanner")}>{t.tabScan}</button>
          <button style={{ ...styles.tab, ...(activeTab === "inbox" ? styles.tabActive : {}) }} onClick={() => setActiveTab("inbox")}>{t.tabInbox}</button>
          <button style={{ ...styles.tab, ...(activeTab === "community" ? styles.tabActive : {}) }} onClick={() => setActiveTab("community")}>{t.tabCommunity}</button>
          <button style={{ ...styles.tab, ...(activeTab === "history" ? styles.tabActive : {}) }} onClick={() => setActiveTab("history")}>{t.tabHistory}</button>
          <button style={{ ...styles.tab, ...(activeTab === "contacts" ? styles.tabActive : {}) }} onClick={() => setActiveTab("contacts")}>{t.tabContacts}</button>
        </div>

        {/* ── SCANNER TAB ── */}
        {activeTab === "scanner" && (
          <div>
            <div style={styles.card}>
              <label style={styles.label}>{t.pasteLabel}</label>
              <textarea
                style={styles.textarea}
                placeholder={t.placeholder}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <div style={styles.chips}>
                <span style={styles.chipLabel}>{t.tryLabel}</span>
                <button style={styles.chip} onClick={() => setMessage(EXAMPLES.kyc)}>{t.chips.kyc}</button>
                <button style={styles.chip} onClick={() => setMessage(EXAMPLES.lottery)}>{t.chips.lottery}</button>
                <button style={styles.chip} onClick={() => setMessage(EXAMPLES.safe)}>{t.chips.safe}</button>
                <button style={styles.chip} onClick={() => setMessage(EXAMPLES.otp)}>{t.chips.otp}</button>
              </div>
            </div>

            <button style={{ ...styles.scanBtn, opacity: loading ? 0.7 : 1 }} onClick={scanMessage} disabled={loading}>
              {loading ? t.scanningBtn : t.scanBtn}
            </button>

            <button style={styles.pasteBtn} onClick={pasteAndScan} disabled={loading}>
              {t.pasteBtn}
            </button>

            {result && c && (
              <div style={{ ...styles.resultCard, background: c.bg, borderColor: c.border }}>
                <h2 style={{ ...styles.resultTitle, color: c.text }}>{c.label}</h2>

                <div style={styles.riskRow}>
                  <span>{t.riskScore}</span>
                  <span style={{ color: c.text, fontWeight: 600 }}>{result.risk_score}%</span>
                </div>
                <div style={styles.barBg}>
                  <div style={{ ...styles.barFill, width: `${result.risk_score}%`, background: c.border }} />
                </div>

                <div style={styles.aiBox}>
                  <div style={styles.aiTopRow}>
                    <div style={styles.aiLabel}>{t.aiLabel}</div>
                    <button
                      style={{ ...styles.speakBtn, background: speaking ? "rgba(124,109,250,0.3)" : "rgba(124,109,250,0.1)" }}
                      onClick={speakText}
                    >
                      {speaking ? t.stop : t.readAloud}
                    </button>
                  </div>
                  <p style={styles.aiText}>{aiText}</p>
                </div>

                <div style={styles.flagsRow}>
                  {result.triggered_flags && result.triggered_flags.length > 0
                    ? result.triggered_flags.map(f => (
                        <span key={f} style={{ ...styles.flag, borderColor: c.border, color: c.text }}>⚡ {f}</span>
                      ))
                    : <span style={{ ...styles.flag, borderColor: c.border, color: c.text }}>{t.noFlags}</span>
                  }
                </div>
                {result.risk_level === "danger" && (
  <div>
    <button style={styles.alertBtn} onClick={() => openFamilyAlert("Suspicious scam message detected")}>
      {t.alertBtn}
    </button>

    {/* Quick alert saved contacts */}
    {contacts.length > 0 && (
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {contacts.map(contact => (
          <button
            key={contact.id}
            style={styles.quickAlertBtn}
            onClick={() => quickAlert(contact)}
          >
            🚨 Alert {contact.name}
          </button>
        ))}
      </div>
    )}
                    
                    {getLinks(message).length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <p style={{ color: "#ff3a5c", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
                          {t.suspiciousLinks}
                        </p>
                        {getLinks(message).map((link, i) => (
                          <div key={i} style={styles.linkCard}>
                            <span style={styles.linkText}>🔗 {link}</span>
                            <button style={styles.linkAlertBtn} onClick={() => openFamilyAlert(link)}>
                              {t.alertFamily}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── INBOX TAB ── */}
        {activeTab === "inbox" && (
          <div>
            <p style={{ color: "#7070a0", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{t.inboxNote}</p>
            {mockMessages.map(msg => (
              <div key={msg.id}
                style={{ ...styles.inboxCard, borderColor: msg.scanned === "danger" ? "#ff3a5c" : "#00e5a0", cursor: "pointer" }}
                onClick={() => { setMessage(msg.full); setActiveTab("scanner"); setResult(null); setAiText(""); fullExplanationRef.current = ""; }}>
                <div style={styles.inboxRow}>
                  <div style={styles.inboxAvatar}>{(lang === "hi" ? msg.fromHi : msg.from)[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.inboxTopRow}>
                      <span style={styles.inboxFrom}>{lang === "hi" ? msg.fromHi : msg.from}</span>
                      <span style={styles.inboxTime}>{msg.time}</span>
                    </div>
                    <div style={styles.inboxPreview}>{lang === "hi" ? msg.previewHi : msg.preview}</div>
                  </div>
                  <div style={{ ...styles.inboxBadge, background: msg.scanned === "danger" ? "#ff3a5c20" : "#00e5a020", color: msg.scanned === "danger" ? "#ff3a5c" : "#00e5a0", borderColor: msg.scanned === "danger" ? "#ff3a5c" : "#00e5a0" }}>
                    {msg.scanned === "danger" ? t.scam : t.safeTag}
                  </div>
                </div>
              </div>
            ))}
            <p style={{ color: "#7070a0", fontSize: 12, textAlign: "center", marginTop: 16 }}>{t.inboxTap}</p>
          </div>
        )}

        {/* ── COMMUNITY TAB ── */}
        {activeTab === "community" && (
  <CommunityDashboard
    lang={lang}
    onNavigate={(id) => {
      if (id === "scan") setActiveTab("scanner");
      if (id === "history") setActiveTab("history");
      if (id === "contacts") setActiveTab("contacts");
    }}
  />
)}
        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div>
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <div style={styles.statNumber}>{totalScans}</div>
                <div style={styles.statLabel}>{t.historyTotal}</div>
              </div>
              <div style={{ ...styles.statBox, borderColor: "#ff3a5c" }}>
                <div style={{ ...styles.statNumber, color: "#ff3a5c" }}>{dangerScans}</div>
                <div style={styles.statLabel}>{t.historyDanger}</div>
              </div>
              <div style={{ ...styles.statBox, borderColor: "#00e5a0" }}>
                <div style={{ ...styles.statNumber, color: "#00e5a0" }}>{safeScans}</div>
                <div style={styles.statLabel}>{t.historySafe}</div>
              </div>
            </div>
            {history.length === 0 ? (
              <p style={{ color: "#7070a0", textAlign: "center", marginTop: 40 }}>{t.historyEmpty}</p>
            ) : (
              <div>
                <button style={styles.clearBtn} onClick={clearHistory}>{t.historyClear}</button>
                {history.map(item => (
                  <div key={item.id} style={{ ...styles.historyCard, borderColor: historyColors[item.risk_level] }}>
                    <div style={styles.historyTop}>
                      <span style={{ color: historyColors[item.risk_level], fontWeight: 700, fontSize: 14 }}>
                        {item.risk_level === "danger" ? "🚨 SCAM" : item.risk_level === "medium" ? "⚠️ SUSPICIOUS" : "✅ SAFE"}
                      </span>
                      <span style={{ color: "#7070a0", fontSize: 12 }}>{item.timestamp}</span>
                    </div>
                    <p style={{ color: "#f0f0f8", fontSize: 14, margin: "8px 0" }}>{item.message_preview}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: historyColors[item.risk_level], fontSize: 13, fontWeight: 600 }}>
                        Risk: {item.risk_score}%
                      </span>
                      <span style={{ color: item.dataset_used ? "#00e5a0" : "#7070a0", fontSize: 12 }}>
                        {item.dataset_used ? t.datasetUsed : t.datasetNotUsed}
                      </span>
                    </div>
                    {item.triggered_flags && item.triggered_flags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        {item.triggered_flags.slice(0, 3).map((f, j) => (
                          <span key={j} style={styles.flagChip}>⚡ {f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {activeTab === "contacts" && (
          <div>
            <div style={styles.contactFormCard}>
              <h3 style={{ color: "#f0f0f8", fontSize: 16, marginBottom: 16 }}>{t.savedContacts}</h3>
              <input
                style={styles.contactInput}
                placeholder={t.contactName}
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
              />
              <input
                style={{ ...styles.contactInput, marginTop: 10 }}
                placeholder={t.contactNumber}
                value={newContactNumber}
                onChange={e => setNewContactNumber(e.target.value)}
                maxLength={10}
                type="tel"
              />
              <button style={styles.saveContactBtn} onClick={saveContact}>{t.saveContact}</button>
            </div>

            {contacts.length === 0 ? (
              <p style={{ color: "#7070a0", textAlign: "center", marginTop: 24 }}>{t.noContacts}</p>
            ) : (
              contacts.map(contact => (
                <div key={contact.id} style={styles.contactCard}>
                  <div style={styles.contactAvatar}>{contact.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#f0f0f8", fontWeight: 600, fontSize: 15 }}>{contact.name}</div>
                    <div style={{ color: "#7070a0", fontSize: 13 }}>+{contact.number}</div>
                  </div>
                  <button style={styles.quickAlertBtn} onClick={() => quickAlert(contact)}>{t.quickAlert}</button>
                  <button style={styles.deleteBtn} onClick={() => deleteContact(contact.id)}>{t.deleteContact}</button>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* ── WhatsApp Modal ── */}
      {showWhatsAppModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ color: "#f0f0f8", fontSize: 18, marginBottom: 6 }}>{t.modalTitle}</h3>
            <p style={{ color: "#7070a0", fontSize: 13, marginBottom: 20 }}>{t.modalSubtitle}</p>
            <input
              style={styles.modalInput}
              placeholder={t.modalPlaceholder}
              value={familyNumber}
              onChange={e => setFamilyNumber(e.target.value)}
              maxLength={10}
              type="tel"
            />
            <p style={{ color: "#7070a0", fontSize: 12, marginBottom: 20 }}>{t.modalNote}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={styles.cancelBtn} onClick={() => { setShowWhatsAppModal(false); setFamilyNumber(""); }}>
                {t.cancel}
              </button>
              <button style={styles.sendBtn} onClick={sendFamilyAlert}>{t.send}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: "#0a0a0f", minHeight: "100vh", fontFamily: "sans-serif", color: "#f0f0f8" },
  container: { maxWidth: 660, margin: "0 auto", padding: "32px 20px 80px" },
  topLangRow: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 20 },
  topLangBtn: { background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 100, padding: "7px 16px", fontSize: 13, color: "#7070a0", cursor: "pointer" },
  topLangActive: { borderColor: "#7c6dfa", color: "#f0f0f8", background: "rgba(124,109,250,0.1)" },
  header: { textAlign: "center", marginBottom: 28 },
  logoPill: { display: "inline-block", background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 100, padding: "8px 20px", fontSize: 15, fontWeight: 700, marginBottom: 20 },
  h1: { fontSize: 38, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 },
  accent: { background: "linear-gradient(135deg,#7c6dfa,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtitle: { fontSize: 16, color: "#7070a0", lineHeight: 1.6 },
  tabRow: { display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" },
  tab: { flex: 1, padding: "9px 6px", background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 12, fontSize: 12, color: "#7070a0", cursor: "pointer", fontWeight: 600, minWidth: 60 },
  tabActive: { borderColor: "#7c6dfa", color: "#f0f0f8", background: "rgba(124,109,250,0.1)" },
  card: { background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 20, padding: 24, marginBottom: 12 },
  label: { fontSize: 11, color: "#7070a0", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 12 },
  textarea: { width: "100%", background: "#1c1c28", border: "1px solid #2a2a3d", borderRadius: 12, padding: 16, fontSize: 16, color: "#f0f0f8", resize: "none", height: 140, fontFamily: "inherit", outline: "none", lineHeight: 1.6, boxSizing: "border-box" },
  chips: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" },
  chipLabel: { fontSize: 12, color: "#7070a0" },
  chip: { background: "#1c1c28", border: "1px solid #2a2a3d", borderRadius: 100, padding: "5px 12px", fontSize: 12, color: "#7070a0", cursor: "pointer" },
  scanBtn: { width: "100%", padding: 18, background: "linear-gradient(135deg,#7c6dfa,#a855f7)", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, color: "white", cursor: "pointer", marginBottom: 10 },
  pasteBtn: { width: "100%", padding: 14, background: "transparent", border: "1.5px solid #7c6dfa", borderRadius: 14, fontSize: 15, fontWeight: 600, color: "#7c6dfa", cursor: "pointer", marginBottom: 16 },
  resultCard: { borderRadius: 20, padding: 24, border: "1px solid", marginTop: 8 },
  resultTitle: { fontSize: 24, fontWeight: 800, marginBottom: 16 },
  riskRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7070a0", marginBottom: 8 },
  barBg: { height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 100, marginBottom: 18, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 100, transition: "width 1s ease" },
  aiBox: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, marginBottom: 16 },
  aiTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  aiLabel: { fontSize: 11, color: "#7c6dfa", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 },
  speakBtn: { background: "rgba(124,109,250,0.1)", border: "1px solid #7c6dfa", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#7c6dfa", cursor: "pointer", fontWeight: 600 },
  aiText: { fontSize: 15, lineHeight: 1.7, color: "#f0f0f8" },
  flagsRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  flag: { padding: "5px 12px", borderRadius: 100, fontSize: 12, border: "1px solid", fontWeight: 500 },
  alertBtn: { width: "100%", padding: 14, background: "transparent", border: "1.5px solid #ff3a5c", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "#ff3a5c", cursor: "pointer", marginBottom: 10 },
  linkCard: { background: "rgba(255,58,92,0.08)", border: "1px solid #ff3a5c", borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  linkText: { color: "#ff3a5c", fontSize: 13, fontFamily: "monospace", wordBreak: "break-all" },
  linkAlertBtn: { background: "#ff3a5c", color: "white", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
  inboxCard: { background: "#13131a", border: "1px solid", borderRadius: 16, padding: 16, marginBottom: 10 },
  inboxRow: { display: "flex", alignItems: "center", gap: 12 },
  inboxAvatar: { width: 42, height: 42, borderRadius: "50%", background: "#2a2a3d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, flexShrink: 0 },
  inboxTopRow: { display: "flex", justifyContent: "space-between", marginBottom: 4 },
  inboxFrom: { fontSize: 14, fontWeight: 600, color: "#f0f0f8" },
  inboxTime: { fontSize: 11, color: "#7070a0" },
  inboxPreview: { fontSize: 12, color: "#7070a0" },
  inboxBadge: { padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, border: "1px solid", flexShrink: 0 },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  statBox: { background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 14, padding: "14px 10px", textAlign: "center" },
  statNumber: { fontSize: 26, fontWeight: 800, color: "#7c6dfa", marginBottom: 4 },
  statLabel: { fontSize: 10, color: "#7070a0", textTransform: "uppercase" },
  clearBtn: { width: "100%", padding: 11, background: "transparent", border: "1px solid #2a2a3d", borderRadius: 10, fontSize: 13, color: "#7070a0", cursor: "pointer", marginBottom: 14 },
  historyCard: { background: "#13131a", border: "1px solid", borderRadius: 14, padding: 14, marginBottom: 10 },
  historyTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  flagChip: { background: "rgba(255,58,92,0.1)", border: "1px solid rgba(255,58,92,0.3)", borderRadius: 100, padding: "2px 8px", fontSize: 10, color: "#ff3a5c" },
  contactFormCard: { background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 20, padding: 22, marginBottom: 20 },
  contactInput: { width: "100%", background: "#1c1c28", border: "1px solid #2a2a3d", borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#f0f0f8", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  saveContactBtn: { width: "100%", marginTop: 14, padding: 13, background: "linear-gradient(135deg,#7c6dfa,#a855f7)", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, color: "white", cursor: "pointer" },
  contactCard: { background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 },
  contactAvatar: { width: 42, height: 42, borderRadius: "50%", background: "rgba(124,109,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#7c6dfa", flexShrink: 0 },
  quickAlertBtn: { background: "rgba(255,58,92,0.1)", border: "1px solid #ff3a5c", borderRadius: 8, padding: "7px 11px", fontSize: 12, color: "#ff3a5c", cursor: "pointer", fontWeight: 600, flexShrink: 0 },
  deleteBtn: { background: "transparent", border: "1px solid #2a2a3d", borderRadius: 8, padding: "7px 11px", fontSize: 12, color: "#7070a0", cursor: "pointer", flexShrink: 0 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 20, padding: 28, width: "100%", maxWidth: 400 },
  modalInput: { width: "100%", background: "#1c1c28", border: "1px solid #2a2a3d", borderRadius: 10, padding: "13px 14px", fontSize: 16, color: "#f0f0f8", outline: "none", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" },
  cancelBtn: { flex: 1, padding: 13, background: "transparent", border: "1px solid #2a2a3d", borderRadius: 10, fontSize: 14, color: "#7070a0", cursor: "pointer" },
  sendBtn: { flex: 2, padding: 13, background: "linear-gradient(135deg,#7c6dfa,#a855f7)", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer" },
  communityPopup: {
  position: "fixed",
  top: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "linear-gradient(135deg, #1a0a0f, #2a0a0f)",
  border: "1px solid #ff3a5c",
  borderRadius: 14,
  padding: "14px 20px",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  maxWidth: 500,
  width: "90%",
  boxShadow: "0 0 30px rgba(255,58,92,0.3)",
  animation: "slideDown 0.3s ease"
},
popupLeft: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1
},
popupTitle: {
  fontSize: 14,
  fontWeight: 700,
  color: "#ff3a5c",
  marginBottom: 4
},
popupSub: {
  fontSize: 12,
  color: "#9090b0",
  maxWidth: 300,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
},
popupClose: {
  background: "transparent",
  border: "none",
  color: "#7070a0",
  fontSize: 16,
  cursor: "pointer",
  flexShrink: 0
},
};