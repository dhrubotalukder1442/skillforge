from fastapi import FastAPI, UploadFile, File
import uvicorn
import pdfplumber
import io

from nlp_extractor import extract_skills_nlp

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

    matched_skills = extract_skills_nlp(text)

    return {
        "fileName": file.filename,
        "matchedSkills": matched_skills,
        "totalSkillsFound": len(matched_skills),
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)