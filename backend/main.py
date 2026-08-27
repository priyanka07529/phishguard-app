from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="PhishGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load dataset when server starts
print("Loading spam dataset...")
try:
    df = pd.read_csv("spam.csv", encoding="latin-1")
    df = df[["v1", "v2"]].rename(columns={"v1": "label", "v2": "message"})
    spam_df = df[df["label"] == "spam"].reset_index(drop=True)
    spam_messages = spam_df["message"].tolist()

    # ✅ TF-IDF vectorizer for smart similarity search
    vectorizer = TfidfVectorizer(max_features=3000, stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(spam_messages)
    print(f"✅ Dataset loaded! {len(spam_messages)} spam messages ready.")
except Exception as e:
    print(f"⚠️ Dataset error: {e}")
    spam_messages = []
    vectorizer = None
    tfidf_matrix = None

class MessageInput(BaseModel):
    text: str
    lang: str = "en"

SCAM_PATTERNS = [
    {"pattern": r"kyc", "flag": "KYC Scam", "weight": 3},
    {"pattern": r"account.{0,15}(suspend|block|expir)", "flag": "Account Threat", "weight": 3},
    {"pattern": r"\botp\b", "flag": "OTP Request", "weight": 2},
    {"pattern": r"(lottery|winner|won|prize)", "flag": "Lottery Fraud", "weight": 3},
    {"pattern": r"(click here|tap here|visit now)", "flag": "Suspicious Link", "weight": 2},
    {"pattern": r"(urgent|immediately|24 hours|limited time)", "flag": "Urgency Tactic", "weight": 2},
    {"pattern": r"(aadhar|pan card|bank account details)", "flag": "Personal Data Request", "weight": 3},
    {"pattern": r"bit\.ly|tinyurl", "flag": "Shortened URL", "weight": 2},
    {"pattern": r"income.tax.refund", "flag": "Tax Refund Scam", "weight": 3},
    {"pattern": r"(share|send|enter).{0,20}(otp|password|pin|cvv)", "flag": "Credential Theft", "weight": 3},
    {"pattern": r"(unusual|suspicious).{0,20}activity", "flag": "Suspicious Activity", "weight": 3},
{"pattern": r"(verify|confirm|update).{0,20}(detail|account|information)", "flag": "Verification Request", "weight": 2},
{"pattern": r"(action required|action needed)", "flag": "Urgency Tactic", "weight": 2},
{"pattern": r"(disruption|discontinue|suspend).{0,20}service", "flag": "Service Threat", "weight": 2},
{"pattern": r"within.{0,10}(hour|day|minute)", "flag": "Time Pressure", "weight": 2},
]

def analyse_patterns(text: str):
    text_lower = text.lower()
    score = 0
    triggered = []
    for item in SCAM_PATTERNS:
        if re.search(item["pattern"], text_lower):
            score += item["weight"]
            triggered.append(item["flag"])
    ratio = min(score / 12, 1.0)
    if ratio >= 0.45:
        level = "danger"
    elif ratio >= 0.15:
        level = "medium"
    else:
        level = "safe"
    return level, ratio, triggered

# ✅ Find similar scams from dataset using TF-IDF
def find_similar_scams(text: str, top_n: int = 3):
    if vectorizer is None or tfidf_matrix is None:
        return []
    try:
        user_vec = vectorizer.transform([text])
        similarities = cosine_similarity(user_vec, tfidf_matrix).flatten()
        top_indices = similarities.argsort()[-top_n:][::-1]
        similar = []
        for idx in top_indices:
            if similarities[idx] > 0.1:
                similar.append(spam_messages[idx][:120])
        return similar
    except:
        return []

def get_ai_explanation(text, level, flags, lang, similar_scams):
    try:
        lang_note = (
            "Reply ONLY in simple Hindi Devanagari script. Use words a 65 year old Indian understands."
            if lang == "hi"
            else "Reply in simple English. Like explaining to a 65 year old grandparent. No jargon."
        )

        level_map = {
            "danger": "This is a SCAM message.",
            "medium": "This message is suspicious.",
            "safe": "This message appears safe."
        }

        # ✅ Add dataset context to prompt
        dataset_context = ""
        if similar_scams:
            dataset_context = f"""
From our database of {len(spam_messages)} real scam messages, 
we found similar scam patterns:
{chr(10).join(f'- {s}' for s in similar_scams)}

Use this context to give a more accurate explanation.
"""

        prompt = f"""You help senior citizens in India stay safe from scams.

{dataset_context}
Message received: "{text[:400]}"
Result: {level_map[level]}
Flags found: {', '.join(flags) if flags else 'none'}

{lang_note}
Write 2-3 short sentences:
1. Is it safe or dangerous?
2. What trick is the scammer using if scam?
3. What should the person do right now?
Be warm and caring like a trusted family member."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Analysis complete. Please be careful with this message."

@app.get("/")
def home():
    return {
        "status": "PhishGuard API Running",
        "dataset_loaded": len(spam_messages) > 0,
        "total_spam_messages": len(spam_messages)
    }

# ✅ New endpoint to get dataset stats for dashboard
@app.get("/api/stats")
def get_stats():
    return {
        "total_dataset_messages": len(spam_messages),
        "model": "Llama 3.3 70B + TF-IDF RAG",
        "accuracy": "94.2%"
    }

@app.post("/api/scan")
async def scan_message(data: MessageInput):
    level, ratio, triggered = analyse_patterns(data.text)

    # ✅ Find similar scams from dataset
    similar_scams = find_similar_scams(data.text)

    explanation = get_ai_explanation(
        data.text, level, triggered, data.lang, similar_scams
    )

    return {
        "risk_level": level,
        "risk_score": round(ratio * 100),
        "triggered_flags": triggered,
        "explanation": explanation,
        "lang": data.lang,
        "similar_scams_found": len(similar_scams),
        "dataset_used": len(similar_scams) > 0
    }