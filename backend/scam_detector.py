# scam_detector.py
import re

HIGH_RISK_PHRASES = [
    "share your otp", "enter otp", "send otp", "otp is",
    "share your password", "enter password",
    "share your pin", "enter your pin",
    "share your cvv", "enter cvv",
    "share your aadhar", "enter aadhar",
    "share your pan", "enter pan",
    "share your account number", "confirm your account number",
    "share your bank details", "enter bank details",
    "share your card number", "enter card number",
    "you have won", "you won", "lottery", "prize money",
    "claim your prize", "claim reward",
    "click here to update", "click here to verify",
    "click here to claim",
    "bit.ly", "tinyurl.com", "t.me/",
    "your account will be blocked",
    "your account will be suspended",
    "account blocked in 24 hours",
    "kyc expired", "kyc has expired",
    "update your kyc",
    "call now to claim",
    "government lottery",
    "income tax refund",
    "emi waiver",
]

MEDIUM_RISK_PHRASES = [
    "unusual activity",
    "suspicious activity",
    "confirm your details",
    "verify your details",
    "verify your account",
    "confirm your account",
    "update your details",
    "action required",
    "immediate action",
    "limited time",
    "offer expires",
    "act now",
    "respond immediately",
    "your account may be",
    "we have noticed",
    "we noticed",
    "unauthorised login",
    "unauthorized login",
    "login attempt",
    "we have detected",
]

SAFE_OVERRIDE_PHRASES = [
    "never share", "do not share", "don't share",
    "never give", "do not give", "don't give",
    "beware", "this is your otp",
    "do not disclose", "never disclose",
]

def detect_scam(text: str, lang: str = "en") -> dict:
    lower = text.lower()

    has_safe_override = any(phrase in lower for phrase in SAFE_OVERRIDE_PHRASES)
    high_matches  = [p for p in HIGH_RISK_PHRASES  if p in lower]
    medium_matches = [p for p in MEDIUM_RISK_PHRASES if p in lower]

    score = 0
    score += len(high_matches)   * 35
    score += len(medium_matches) * 20
    score = min(score, 100)

    if has_safe_override and score < 60:
        score = max(score - 40, 5)

    if score >= 60:
        risk_level = "danger"
    elif score >= 25:
        risk_level = "medium"
    else:
        risk_level = "safe"

    triggered_flags = high_matches + medium_matches
    explanation = build_explanation(risk_level, triggered_flags, has_safe_override, lang)

    return {
        "risk_level":      risk_level,
        "risk_score":      score,
        "triggered_flags": triggered_flags,
        "explanation":     explanation,
    }

def build_explanation(risk_level, flags, safe_override, lang="en"):
    if lang == "hi":
        return _explanation_hindi(risk_level, flags, safe_override)

    if risk_level == "danger":
        flag_text = ""
        if flags:
            flag_text = f" Suspicious phrases found: {', '.join(flags[:3])}."
        return (
            "This message is very dangerous!"
            f"{flag_text} "
            "Scammers use these tricks to steal your money or personal "
            "information. Real banks and government offices will NEVER ask "
            "for your OTP, password, or account number over SMS or phone. "
            "Please do NOT click any links or share any details. "
            "Hang up the call and dial your bank's official number directly."
        )
    elif risk_level == "medium":
        flag_text = ""
        if flags:
            flag_text = f" Watch out for phrases like: '{flags[0]}'."
        return (
            "Be careful — this message looks suspicious."
            f"{flag_text} "
            "It is trying to create worry or urgency to make you act fast. "
            "Do NOT share any personal details. "
            "If it is really from your bank, they will show the same "
            "information when you log in to your account directly. "
            "Call your bank's official helpline to double-check."
        )
    else:
        if safe_override:
            return (
                "This message looks like a genuine warning from your bank. "
                "It is reminding you to protect your OTP and not share it "
                "with anyone — which is correct advice! "
                "No action is needed from your side."
            )
        return (
            "This message looks safe. "
            "No suspicious patterns or scam phrases were found. "
            "However, always be careful — if someone you don't know is "
            "asking for personal information, it is okay to say no "
            "and call your family member to check first."
        )

def _explanation_hindi(risk_level, flags, safe_override):
    if risk_level == "danger":
        return (
            "यह संदेश बहुत खतरनाक है! "
            "यह एक धोखाधड़ी का प्रयास है। "
            "असली बैंक या सरकार कभी भी SMS या फोन पर आपका OTP, "
            "पासवर्ड या खाता नंबर नहीं मांगती। "
            "कोई भी लिंक पर क्लिक न करें और कोई जानकारी न दें। "
            "तुरंत फोन काटें और अपने बैंक के असली नंबर पर कॉल करें।"
        )
    elif risk_level == "medium":
        return (
            "सावधान रहें — यह संदेश संदिग्ध लगता है। "
            "यह आपको जल्दी में कुछ करवाने की कोशिश कर रहा है। "
            "कोई भी व्यक्तिगत जानकारी न दें। "
            "अपने बैंक के असली हेल्पलाइन नंबर पर कॉल करके पुष्टि करें।"
        )
    else:
        if safe_override:
            return (
                "यह संदेश आपके बैंक की तरफ से एक असली चेतावनी लगती है। "
                "यह आपको याद दिला रहा है कि अपना OTP किसी के साथ साझा न करें। "
                "आपको कुछ करने की जरूरत नहीं है।"
            )
        return (
            "यह संदेश सुरक्षित लगता है। "
            "इसमें कोई संदिग्ध शब्द या धोखाधड़ी के संकेत नहीं मिले। "
            "फिर भी, अगर कोई अनजान व्यक्ति आपसे जानकारी मांगे, "
            "तो मना कर दें और अपने परिवार को बताएं।"
        )