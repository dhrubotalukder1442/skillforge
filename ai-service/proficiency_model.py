import csv
import re
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "proficiency_training_data.csv"


# ============================================================
# 1. LOAD TRAINING DATA
# ============================================================

def load_training_data():
    texts = []
    labels = []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for row in reader:
            sentence = row["sentence"].strip()
            skill = row["skill"].strip()
            label = row["label"].strip()

            if sentence and skill and label:
                training_text = f"{sentence} [SKILL] {skill}"

                texts.append(training_text)
                labels.append(label)

    return texts, labels


# ============================================================
# 2. TRAIN ML MODEL
# ============================================================

def train_model():

    texts, labels = load_training_data()

    model = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                ngram_range=(1, 2),
                sublinear_tf=True
            )
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                class_weight="balanced"
            )
        )
    ])

    model.fit(texts, labels)

    return model


proficiency_model = train_model()


# ============================================================
# 3. RULE-BASED PROFICIENCY DETECTION
# ============================================================

BEGINNER_PATTERNS = [
    r"\bbasic knowledge\b",
    r"\bbasic familiarity\b",
    r"\bbasic understanding\b",
    r"\bbeginner[- ]level\b",
    r"\bnew to\b",
    r"\bcurrently learning\b",
    r"\bfollowing a beginner course\b",
    r"\bintroductory course\b",
    r"\bonline tutorial\b",
    r"\blimited practical use\b",
    r"\bonly used\b",
    r"\bcouple of homework assignments\b",
    r"\bhomework assignments\b",
    r"\bthrough coursework\b",
    r"\bthrough course work\b",
    r"\buniversity project\b",
    r"\bstarted exploring\b",
    r"\bstill getting comfortable\b",
    r"\bfamiliar with\b",
    r"\bexposed to\b"
]


INTERMEDIATE_PATTERNS = [
    r"\bhands-on experience\b",
    r"\bone year of experience\b",
    r"\btwo years of experience\b",
    r"\bone year of\b",
    r"\btwo years of\b",
    r"\bworked with\b",
    r"\bworked with .* for several months\b",
    r"\bseveral months\b",
    r"\bhands-on experience\b",
    r"\bdeveloped features\b",
    r"\bimplemented core functionality\b",
    r"\bbuilt a personal project\b",
    r"\bbuilt a full application\b",
    r"\bside projects\b",
    r"\bsemester-long project\b",
    r"\bteam project\b",
    r"\bgroup project\b",
    r"\binternship\b",
    r"\bregularly use\b",
    r"\bday-to-day development\b",
    r"\bcomfortable writing\b",
    r"\bsolid working knowledge\b",
    r"\bcan independently build features\b",
    r"\bpractical problems in coursework\b"
]


EXPERT_PATTERNS = [
    r"\bdeep expertise\b",
    r"\bextensive production experience\b",
    r"\bfive years of professional experience\b",
    r"\barchitected scalable solutions\b",
    r"\bdesigned the core architecture\b",
    r"\boptimized performance-critical\b",
    r"\bdrove major performance improvements\b",
    r"\bled a team\b",
    r"\bmentored junior developers\b",
    r"\btrained the engineering team\b",
    r"\bmission-critical infrastructure\b",
    r"\btechnical roadmap\b",
    r"\benterprise clients\b",
    r"\brecognized internally as the go-to expert\b",
    r"\badvanced .* techniques\b",
    r"\badvanced .* concepts\b",
    r"\badvanced .* patterns\b",
    r"\bopen-source projects\b",
    r"\bat scale\b"
]


def contains_pattern(text, patterns):
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


# ============================================================
# 4. EXTRACT SKILL-SPECIFIC CONTEXT
# ============================================================

def get_skill_context(sentence: str, skill: str) -> str:

    sentence = sentence.strip()
    skill = skill.strip()

    # Find the target skill
    match = re.search(
        re.escape(skill),
        sentence,
        re.IGNORECASE
    )

    if not match:
        return sentence

    # Look left until a clause separator
    start = match.start()
    while start > 0 and sentence[start - 1] not in {",", ";", "."}:
        start -= 1

    # Look right until a clause separator
    end = match.end()
    while end < len(sentence) and sentence[end] not in {",", ";", "."}:
        end += 1

    context = sentence[start:end].strip()

    return context


# ============================================================
# 5. RULE-BASED PREDICTION
# ============================================================

def rule_based_prediction(context: str):

    text = context.lower()

    # Expert should have highest priority
    if contains_pattern(text, EXPERT_PATTERNS):
        return "Expert"

    # Intermediate-specific phrases
    if contains_pattern(text, INTERMEDIATE_PATTERNS):
        return "Intermediate"

    # Beginner-specific phrases
    if contains_pattern(text, BEGINNER_PATTERNS):
        return "Beginner"

    return None


# ============================================================
# 6. FINAL PREDICTION
# ============================================================

def predict_proficiency(sentence: str, skill: str) -> str:

    # Get only relevant context around target skill
    context = get_skill_context(sentence, skill)

    # First try deterministic rules
    rule_prediction = rule_based_prediction(context)

    if rule_prediction:
        return rule_prediction

    # No explicit proficiency signal found in context.
    # ML fallback defaults to "Beginner" with no real signal,
    # which is misleading — so report it as unspecified instead.
    return "Not specified"