"""
프로젝트 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.models.project import Project
from app.services.n8n_mcp_service import N8nMCPService

router = APIRouter()

# Pydantic 모델들
class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    status: str
    
    class Config:
        from_attributes = True

class WBSGenerationRequest(BaseModel):
    project_id: int
    proposal_text: str
    rfp_text: str
    project_goals: str
    team_members: List[dict]

class DocumentGenerationRequest(BaseModel):
    project_id: int
    proposal_text: str
    rfp_text: str
    requirements_doc: str

class DeliverableGenerationRequest(BaseModel):
    project_id: int
    system_design: dict
    source_code: str
    architecture_info: str

class N8nMCPWBSRequest(BaseModel):
    project_id: int
    proposal_content: str
    rfp_content: str
    project_goals: str
    team_members: List[dict]

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """새 프로젝트 생성"""
    db_project = Project(name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    """프로젝트 목록 조회"""
    projects = db.query(Project).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """특정 프로젝트 조회"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    return project

@router.post("/generate-wbs")
async def generate_wbs(request: WBSGenerationRequest):
    """WBS 생성"""
    try:
        extractor = RequirementExtractor()
        result = await extractor.create_project_wbs(
            project_id=request.project_id,
            proposal_text=request.proposal_text,
            rfp_text=request.rfp_text,
            project_goals=request.project_goals,
            team_members=request.team_members
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-documents")
async def generate_documents(request: DocumentGenerationRequest):
    """설계문서 생성"""
    try:
        generator = DocumentGenerator()
        result = await generator.generate_project_documents(
            project_id=request.project_id,
            proposal_text=request.proposal_text,
            rfp_text=request.rfp_text,
            requirements_doc=request.requirements_doc
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-deliverables")
async def generate_deliverables(request: DeliverableGenerationRequest):
    """산출물 생성"""
    try:
        automation = DeliverableAutomation()
        result = await automation.generate_project_deliverables(
            project_id=request.project_id,
            source_code=request.source_code,
            architecture_info=request.architecture_info,
            system_design=request.system_design,
            test_cases={},  # 실제로는 테스트 케이스 데이터가 필요
            functional_requirements=[]  # 실제로는 기능 요구사항 데이터가 필요
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-mcp-wbs")
async def generate_mcp_wbs(request: N8nMCPWBSRequest):
    """n8n MCP 서버 기반 LLM 연동 WBS 생성"""
    try:
        mcp_service = N8nMCPService()
        result = await mcp_service.process_mcp_wbs(
            project_id=request.project_id,
            proposal_content=request.proposal_content,
            rfp_content=request.rfp_content,
            project_goals=request.project_goals,
            team_members=request.team_members
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
