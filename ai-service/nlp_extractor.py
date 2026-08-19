import re

import spacy
from spacy.matcher import PhraseMatcher

from skills_data import SKILLS
from proficiency_model import predict_proficiency


# Load English model once
nlp = spacy.load("en_core_web_sm")


# Case-insensitive skill matcher
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

patterns = [nlp.make_doc(skill) for skill in SKILLS]
matcher.add("SKILLS", patterns)


# Proficiency keywords
EXPERT_PATTERNS = [
    r"\bdeep expertise\b",
    r"\bexpert\b",
    r"\bexpertise\b",
    r"\badvanced\b",
    r"\badvanced knowledge\b",
    r"\badvanced experience\b",
    r"\bextensive experience\b",
    r"\bextensive knowledge\b",
    r"\bhighly proficient\b",
    r"\bproficient\b",
    r"\bprofessional experience\b",
    r"\bprofessional expertise\b",
    r"\b\d+\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience\b",
]


INTERMEDIATE_PATTERNS = [
    r"\bhands-on experience\b",
    r"\bhands on experience\b",
    r"\bintermediate\b",
    r"\bworked with\b",
    r"\bexperience with\b",
    r"\bexperienced with\b",
    r"\bused\b",
    r"\busing\b",
    r"\bdeveloped with\b",
    r"\bworked on\b",
    r"\bpractical experience\b",
]


BEGINNER_PATTERNS = [
    r"\bbasic\b",
    r"\bbeginner\b",
    r"\bbeginner-level\b",
    r"\bfamiliar with\b",
    r"\bfamiliarity with\b",
    r"\blimited experience\b",
    r"\blimited knowledge\b",
    r"\bsome knowledge\b",
    r"\bsome experience\b",
    r"\bbasic understanding\b",
]


def detect_explicit_proficiency(context: str):
    """
    Detect proficiency from explicit words/phrases
    around a specific skill.

    Order matters: Expert -> Intermediate -> Beginner.
    """

    context = context.lower()

    # Expert has highest priority
    for pattern in EXPERT_PATTERNS:
        if re.search(pattern, context):
            return "Expert"

    # Intermediate next
    for pattern in INTERMEDIATE_PATTERNS:
        if re.search(pattern, context):
            return "Intermediate"

    # Beginner last
    for pattern in BEGINNER_PATTERNS:
        if re.search(pattern, context):
            return "Beginner"

    return None


def get_skill_context(doc, start, end):
    """
    Get the local clause context for a skill span.
    Stops at 'and', ',', ';', '.' on both sides so that
    another skill's proficiency keyword doesn't leak in.
    """
    separators = {"and", ",", ";", "."}

    left = start
    while left > 0 and doc[left - 1].text.lower() not in separators:
        left -= 1

    right = end
    while right < len(doc) and doc[right].text.lower() not in separators:
        right += 1

    return doc[left:right].text


def extract_skills_nlp(text: str):
    """
    Extract skills and estimate proficiency.
    """

    doc = nlp(text)
    matches = matcher(doc)

    found_skills = {}

    for match_id, start, end in matches:

        span = doc[start:end]
        matched_text = span.text

        # Find original skill name from SKILLS list
        matched_skill = None

        for skill in SKILLS:
            if skill.lower() == matched_text.lower():
                matched_skill = skill
                break

        if not matched_skill:
            continue

        # Get local context around this skill
        context = get_skill_context(
            doc,
            start,
            end
        )

        # First try explicit proficiency detection
        proficiency = detect_explicit_proficiency(context)

        # If no explicit proficiency was found,
        # use the ML model as fallback.
        if proficiency is None:
            proficiency = predict_proficiency(
                context,
                matched_skill
            )

        found_skills[matched_skill] = {
            "skill": matched_skill,
            "proficiency": proficiency
        }

    return sorted(
        found_skills.values(),
        key=lambda item: item["skill"].lower()
    )