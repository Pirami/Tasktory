"""
Tasktory 메인 애플리케이션
FastAPI 기반의 n8n MCP client 프로젝트 관리 자동화 시스템
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.database import init_db
from app.api.v1.router import router as api_router
from app.core.n8n_client import N8nMCPClient
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시 초기화
    await init_db()
    app.state.n8n_client = N8nMCPClient()
    yield
    # 종료 시 정리
    pass

# FastAPI 앱 생성
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="n8n MCP client 기반 프로젝트 관리 자동화 시스템",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Tasktory API 서버가 실행 중입니다",
        "version": settings.app_version,
        "n8n_mcp_enabled": bool(settings.n8n_mcp_api_key)
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "service": "tasktory"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
