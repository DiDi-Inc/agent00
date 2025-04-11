from __future__ import annotations

import asyncio
from collections.abc import Sequence
from typing import TypedDict # Add TypedDict for return type clarity

# Remove unused Rich Console and Printer
# from rich.console import Console

from agents import Runner, RunResult, custom_span, gen_trace_id, trace

# Update agent imports to use the copied location
from webapp.financial_agents.financials_agent import financials_agent
from webapp.financial_agents.planner_agent import FinancialSearchItem, FinancialSearchPlan, planner_agent
from webapp.financial_agents.risk_agent import risk_agent
from webapp.financial_agents.search_agent import search_agent
from webapp.financial_agents.verifier_agent import VerificationResult, verifier_agent
from webapp.financial_agents.writer_agent import FinancialReportData, writer_agent

# Removed Printer import
# from .printer import Printer

# Define a return type for the run method, similar to ResearchResult in main.py
class FinancialResultData(TypedDict):
    summary: str
    report: str
    follow_up_questions: list[str]
    verification_issues: str | None
    trace_url: str

async def _summary_extractor(run_result: RunResult) -> str:
    """Custom output extractor for sub‑agents that return an AnalysisSummary."""
    # The financial/risk analyst agents emit an AnalysisSummary with a `summary` field.
    # We want the tool call to return just that summary text so the writer can drop it inline.
    return str(run_result.final_output.summary)


class Manager:
    """
    Orchestrates the full flow: planning, searching, sub‑analysis, writing, and verification.
    Modified for web backend integration - returns data instead of printing.
    """

    def __init__(self) -> None:
        # Remove console and printer initialization
        # self.console = Console()
        # self.printer = Printer(self.console)
        pass # No initialization needed for now

    async def run(self, query: str) -> FinancialResultData:
        trace_id = gen_trace_id()
        trace_url = f"https://platform.openai.com/traces/trace?trace_id={trace_id}"

        with trace("Financial research trace", trace_id=trace_id):
            # Removed printer updates
            search_plan = await self._plan_searches(query)
            search_results = await self._perform_searches(search_plan)
            report_data = await self._write_report(query, search_results)
            verification = await self._verify_report(report_data)

            # Construct the result dictionary
            result = FinancialResultData(
                summary=report_data.short_summary,
                report=report_data.markdown_report,
                follow_up_questions=report_data.follow_up_questions,
                verification_issues=verification.issues if not verification.verified else None,
                trace_url=trace_url,
            )
            return result

        # Removed final printing

    async def _plan_searches(self, query: str) -> FinancialSearchPlan:
        # Removed printer updates
        result = await Runner.run(planner_agent, f"Query: {query}")
        # Removed printer updates
        return result.final_output_as(FinancialSearchPlan)

    async def _perform_searches(self, search_plan: FinancialSearchPlan) -> Sequence[str]:
         # Removed printer updates
        with custom_span("Search the web"):
            tasks = [asyncio.create_task(self._search(item)) for item in search_plan.searches]
            results: list[str] = []
            # Simplified - just await all tasks
            search_task_results = await asyncio.gather(*tasks, return_exceptions=True)
            for result in search_task_results:
                if isinstance(result, str):
                    results.append(result)
                elif isinstance(result, Exception):
                    print(f"Search task failed: {result}") # Log error instead of stopping
            # Removed printer updates
            return results

    async def _search(self, item: FinancialSearchItem) -> str | None:
        input_data = f"Search term: {item.query}\nReason: {item.reason}"
        # No try-except needed here, asyncio.gather(return_exceptions=True) handles it
        result = await Runner.run(search_agent, input_data)
        return str(result.final_output)

    async def _write_report(self, query: str, search_results: Sequence[str]) -> FinancialReportData:
        # Expose the specialist analysts as tools so the writer can invoke them inline
        # and still produce the final FinancialReportData output.
        fundamentals_tool = financials_agent.as_tool(
            tool_name="fundamentals_analysis",
            tool_description="Use to get a short write‑up of key financial metrics",
            custom_output_extractor=_summary_extractor,
        )
        risk_tool = risk_agent.as_tool(
            tool_name="risk_analysis",
            tool_description="Use to get a short write‑up of potential red flags",
            custom_output_extractor=_summary_extractor,
        )
        writer_with_tools = writer_agent.clone(tools=[fundamentals_tool, risk_tool])
        # Removed printer updates
        input_data = f"Original query: {query}\nSummarized search results: {search_results}"
        # Use non-streaming run
        result = await Runner.run(writer_with_tools, input_data)
        # Removed streaming logic and printer updates
        return result.final_output_as(FinancialReportData)

    async def _verify_report(self, report: FinancialReportData) -> VerificationResult:
        # Removed printer updates
        result = await Runner.run(verifier_agent, report.markdown_report)
        # Removed printer updates
        return result.final_output_as(VerificationResult)
