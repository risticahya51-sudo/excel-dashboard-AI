import pandas as pd
from typing import Dict, Any


def analyze_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    columns_info = []

    for col in df.columns:
        dtype = str(df[col].dtype)
        null_count = int(df[col].isnull().sum())
        unique_count = int(df[col].nunique())

        col_info = {
            "name": col,
            "dtype": dtype,
            "null_count": null_count,
            "unique_count": unique_count,
        }

        if df[col].dtype in ["int64", "float64"]:
            col_info["min"] = float(df[col].min()) if not df[col].isnull().all() else None
            col_info["max"] = float(df[col].max()) if not df[col].isnull().all() else None
            col_info["mean"] = float(df[col].mean()) if not df[col].isnull().all() else None
            col_info["is_numeric"] = True
        else:
            col_info["is_numeric"] = False
            if unique_count <= 20:
                col_info["sample_values"] = df[col].dropna().unique().tolist()[:10]

        columns_info.append(col_info)

    return {
        "rows": len(df),
        "cols": len(df.columns),
        "columns": columns_info,
        "memory_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
    }
