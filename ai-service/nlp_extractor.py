import spacy
from spacy.matcher import PhraseMatcher
from skills_data import SKILLS

# Load the English model once at import time (not per-request, which would be slow)
nlp = spacy.load("en_core_web_sm")

# PhraseMatcher respects word boundaries and can match multi-word phrases
# attr="LOWER" makes matching case-insensitive
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

# Build patterns from our skills list and register them
patterns = [nlp.make_doc(skill) for skill in SKILLS]
matcher.add("SKILLS", patterns)


def extract_skills_nlp(text: str) -> list[str]:
    """
    Extract skills from resume text using spaCy's PhraseMatcher.
    Unlike substring matching, this respects word boundaries,
    so 'SQL' won't incorrectly match inside 'PostgreSQL'.
    """
    doc = nlp(text)
    matches = matcher(doc)

    found_skills = set()
    for match_id, start, end in matches:
        span = doc[start:end]
        # Find the original casing from our SKILLS list for consistent output
        matched_text = span.text
        for skill in SKILLS:
            if skill.lower() == matched_text.lower():
                found_skills.add(skill)
                break

    return sorted(found_skills)