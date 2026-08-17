from fastapi import FastAPI, UploadFile, File
import uvicorn
import pdfplumber
import io

from skills_data import SKILLS

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "SkillForge AI service is running"}

@app.post("/extract-skills")
async def extract_skills(file: UploadFile = File(...)):
    contents = await file.read()

    text = ""
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    text_lower = text.lower()

    matched_skills = []
    for skill in SKILLS:
        if skill.lower() in text_lower:
            matched_skills.append(skill)

    return {
        "fileName": file.filename,
        "matchedSkills": matched_skills,
        "totalSkillsFound": len(matched_skills),
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)