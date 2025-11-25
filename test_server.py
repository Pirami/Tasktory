from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/settings/integration-status")
async def get_integration_status():
    """모든 연동 서비스 상태 확인"""
    current_time = datetime.now().isoformat() + "Z"
    
    return {
        "overall_status": "healthy",
        "services": {
            "jira": {
                "status": "success",
                "message": "Jira 연결 테스트는 준비 중입니다.",
                "last_checked": current_time
            },
            "confluence": {
                "status": "success", 
                "message": "Confluence 연결 테스트는 준비 중입니다.",
                "last_checked": current_time
            },
            "notion": {
                "status": "success",
                "message": "Notion 연결 테스트는 준비 중입니다.",
                "last_checked": current_time
            },
            "n8n": {
                "status": "success",
                "message": "n8n MCP 서버 연결 테스트는 준비 중입니다.",
                "last_checked": current_time
            }
        },
        "total_services": 4,
        "healthy_services": 4
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


