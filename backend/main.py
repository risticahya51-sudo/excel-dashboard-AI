from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import json
import io
from services.llm import LLMService
from services.analyzer import analyze_dataframe
from config import settings

app = FastAPI(title="Excel AI Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_service = LLMService()


@app.get("/")
def root():
    return {"status": "ok", "message": "Excel AI Dashboard API"}


@app.get("/config")
def get_config():
    return {
        "base_url": settings.llm_base_url,
        "model": settings.llm_model,
        "has_api_key": bool(settings.llm_api_key),
    }


@app.post("/config")
def update_config(payload: dict):
    if "base_url" in payload:
        settings.llm_base_url = payload["base_url"]
    if "api_key" in payload:
        settings.llm_api_key = payload["api_key"]
    if "model" in payload:
        settings.llm_model = payload["model"]
    llm_service.reload(settings)
    return {"status": "updated"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Only Excel or CSV files are supported.")

    content = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    stats = analyze_dataframe(df)
    sample = df.head(5).to_dict(orient="records")

    prompt = f"""
You are a data analyst. Given this dataset summary, generate a dashboard configuration.

Dataset: {file.filename}
Rows: {stats['rows']}, Columns: {stats['cols']}
Columns info: {json.dumps(stats['columns'])}
Sample data (first 5 rows): {json.dumps(sample)}

Respond ONLY with a valid JSON object (no markdown, no explanation) with this structure:
{{
  "title": "Dashboard title",
  "summary": "2-3 sentence insight about the data",
  "charts": [
    {{
      "id": "chart1",
      "type": "bar|line|pie|scatter",
      "title": "Chart title",
      "x_column": "column name for x axis",
      "y_column": "column name for y axis",
      "description": "What this chart shows"
    }}
  ],
  "kpis": [
    {{
      "label": "KPI label",
      "column": "column name",
      "aggregation": "sum|mean|count|max|min",
      "format": "number|currency|percent"
    }}
  ],
  "insights": ["insight 1", "insight 2", "insight 3"]
}}
Generate 2-4 charts and 2-4 KPIs that make sense for this data.
"""

    result = await llm_service.complete(prompt)

    try:
        clean = result.strip().replace("```json", "").replace("```", "")
        dashboard_config = json.loads(clean)
    except Exception:
        raise HTTPException(status_code=500, detail="LLM returned invalid JSON. Try again.")

    # Compute actual KPI values
    for kpi in dashboard_config.get("kpis", []):
        col = kpi.get("column")
        agg = kpi.get("aggregation", "sum")
        if col and col in df.columns:
            try:
                if agg == "sum":
                    kpi["value"] = float(df[col].sum())
                elif agg == "mean":
                    kpi["value"] = float(df[col].mean())
                elif agg == "count":
                    kpi["value"] = int(df[col].count())
                elif agg == "max":
                    kpi["value"] = float(df[col].max())
                elif agg == "min":
                    kpi["value"] = float(df[col].min())
            except Exception:
                kpi["value"] = None

    # Build chart data
    chart_data = {}
    for chart in dashboard_config.get("charts", []):
        x_col = chart.get("x_column")
        y_col = chart.get("y_column")
        chart_type = chart.get("type", "bar")

        if x_col in df.columns and y_col in df.columns:
            try:
                if chart_type == "pie":
                    grouped = df.groupby(x_col)[y_col].sum().reset_index()
                    chart_data[chart["id"]] = grouped.to_dict(orient="records")
                else:
                    grouped = df.groupby(x_col)[y_col].sum().reset_index()
                    chart_data[chart["id"]] = grouped.head(20).to_dict(orient="records")
            except Exception:
                chart_data[chart["id"]] = []
        else:
            chart_data[chart["id"]] = []

    return JSONResponse({
        "filename": file.filename,
        "stats": stats,
        "dashboard": dashboard_config,
        "chart_data": chart_data,
    })


@app.post("/chat")
async def chat(payload: dict):
    question = payload.get("question", "")
    context = payload.get("context", "")
    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    prompt = f"""
You are a data analyst assistant. Answer the user's question about their dataset.

Dataset context:
{context}

User question: {question}

Give a concise, helpful answer in 2-4 sentences.
"""
    answer = await llm_service.complete(prompt)
    return {"answer": answer}
