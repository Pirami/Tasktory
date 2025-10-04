"""
API v1 라우터
"""
from fastapi import APIRouter
from app.api.v1.endpoints import projects, meetings, documents, wbs, team

router = APIRouter()

# 각 엔드포인트 라우터 등록
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
router.include_router(documents.router, prefix="/documents", tags=["documents"])
router.include_router(wbs.router, prefix="/wbs", tags=["wbs"])
router.include_router(team.router, prefix="/team", tags=["team"])
