from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
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

# Mount static files directory
app.mount("/static", StaticFiles(directory="webapp/static"), name="static")

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

@app.get("/", response_class=FileResponse)
async def read_root():
    # Serve the index.html file
    return 'webapp/static/index.html'

@app.post("/research", response_model=ResearchResult)
async def run_research(query: ResearchQuery):
    logger.info(f"Received research query: '{query.query}'")
    try:
        # Call the actual refactored manager.run method
        result_data = await manager.run(query.query)
        logger.info(f"Research completed for query: '{query.query}'")
        # Convert the TypedDict result from the manager to the Pydantic model
        return ResearchResult(**result_data)
    except Exception as e:
        logger.error(f"Error processing research query '{query.query}': {e}", exc_info=True)
        # Raise an HTTPException to return a proper error response to the client
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")

if __name__ == "__main__":
    import uvicorn
    # Make sure to run from the root directory (agent00) for paths to work
    print("Starting server... Access at http://localhost:8000")
    print("Make sure you are running this script from the 'agent00' directory.")
    uvicorn.run("webapp.main:app", host="0.0.0.0", port=8000, reload=True) # Use reload for development 