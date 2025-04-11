from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import asyncio
import logging

# Add the parent directory to the path to allow importing the agent code
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the refactored financial research manager
from webapp.financial_manager import Manager as FinancialResearchManager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# --- CORS Configuration --- Start
# Define the origins allowed to access the backend.
# You might want to restrict this more in production.
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite dev server port
    "http://localhost:8080", # Add port used by npm run dev
    # Add any other origins your frontend might run on
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)
# --- CORS Configuration --- End

# NOTE: Static file mounting is likely not needed anymore if using a separate frontend project.
# Commenting it out for now.
# app.mount("/static", StaticFiles(directory="webapp/static"), name="static")

# Create the manager instance
manager = FinancialResearchManager()

class ResearchQuery(BaseModel):
    query: str

class ResearchResult(BaseModel):
    summary: str
    report: str
    follow_up_questions: list[str]
    verification_issues: str | None = None
    trace_url: str | None = None

# NOTE: Root route serving index.html is likely not needed anymore.
# Commenting it out for now.
# @app.get("/", response_class=FileResponse)
# async def read_root():
#     # Serve the index.html file
#     return 'webapp/static/index.html'

@app.post("/research", response_model=ResearchResult)
async def run_research(query: ResearchQuery):
    logger.info(f"Received research query: '{query.query}'")
    try:
        result_data = await manager.run(query.query)
        logger.info(f"Research completed for query: '{query.query}'")
        return ResearchResult(**result_data)
    except Exception as e:
        logger.error(f"Error processing research query '{query.query}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")

if __name__ == "__main__":
    import uvicorn
    print("Starting FinNexus Backend API Server... Access at http://localhost:8000")
    print("Make sure you are running this script from the 'agent00' directory.")
    uvicorn.run("webapp.main:app", host="0.0.0.0", port=8000, reload=True) 