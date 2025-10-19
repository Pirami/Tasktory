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
from app.services.enhanced_wbs_service import EnhancedWBSService

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
    start_date: str = None
    end_date: str = None
    
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

class EnhancedWBSRequest(BaseModel):
    project_id: int
    proposal_content: str
    rfp_content: str
    project_goals: str
    team_members: List[dict]
    additional_files: List[dict] = None

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """새 프로젝트 생성"""
    db_project = Project(name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/")
async def get_projects(db: Session = Depends(get_db)):
    """프로젝트 목록 조회"""
    try:
        print("🔍 프로젝트 조회 시작...")
        projects = db.query(Project).all()
        print(f"📊 프로젝트 목록 조회: {len(projects)}개")
        for project in projects:
            print(f"  - {project.id}: {project.name}")
        return projects
    except Exception as e:
        print(f"❌ 프로젝트 목록 조회 실패: {e}")
        import traceback
        traceback.print_exc()
        return []

@router.get("/{project_id}/team-members")
async def get_project_team_members(project_id: int, db: Session = Depends(get_db)):
    """프로젝트에 투입된 팀원 정보 조회"""
    try:
        from app.models.team import ProjectMember, TeamMember
        
        # 프로젝트 멤버 조회
        project_members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
        
        team_members = []
        for pm in project_members:
            member = db.query(TeamMember).filter(TeamMember.id == pm.team_member_id).first()
            if member:
                # skills를 JSON 문자열에서 리스트로 변환
                import json
                try:
                    skills_list = json.loads(member.skills) if member.skills else []
                except:
                    skills_list = []
                
                team_members.append({
                    "id": member.id,
                    "name": member.name,
                    "email": member.email,
                    "role": member.position,
                    "skills": skills_list,
                    "experience_years": member.experience_years,
                    "skill_level": member.skill_level,
                    "availability": member.availability,
                    "project_role": pm.role,
                    "allocation": pm.allocation_percentage
                })
        
        print(f"👥 프로젝트 {project_id} 팀원 정보: {len(team_members)}명")
        return {"team_members": team_members}
    except Exception as e:
        print(f"❌ 프로젝트 팀원 정보 조회 실패: {e}")
        return {"team_members": []}

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

@router.post("/generate-enhanced-wbs")
async def generate_enhanced_wbs(request: EnhancedWBSRequest):
    """고도화된 WBS 생성 (요건 추출, Task 분배, 기간 추정)"""
    try:
        enhanced_service = EnhancedWBSService()
        result = await enhanced_service.generate_enhanced_wbs(
            project_id=request.project_id,
            proposal_content=request.proposal_content,
            rfp_content=request.rfp_content,
            project_goals=request.project_goals,
            team_members=request.team_members,
            additional_files=request.additional_files
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 외부 플랫폼 연동 엔드포인트들
@router.post("/{project_id}/export/jira")
async def export_to_jira(project_id: int, wbs_data: dict):
    """WBS 결과를 Jira에 Task로 생성"""
    try:
        # TODO: Jira API 연동 구현
        return {
            "status": "success",
            "message": "Jira 연동 기능은 준비 중입니다.",
            "jira_issues": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/export/confluence")
async def export_to_confluence(project_id: int, wbs_data: dict):
    """WBS 결과를 Confluence 문서로 생성"""
    try:
        # TODO: Confluence API 연동 구현
        return {
            "status": "success",
            "message": "Confluence 연동 기능은 준비 중입니다.",
            "confluence_page_url": ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/export/notion")
async def export_to_notion(project_id: int, wbs_data: dict):
    """WBS 결과를 Notion 데이터베이스에 업데이트"""
    try:
        # TODO: Notion API 연동 구현
        return {
            "status": "success",
            "message": "Notion 연동 기능은 준비 중입니다.",
            "notion_database_url": ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
