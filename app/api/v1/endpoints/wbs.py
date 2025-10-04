"""
WBS 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.models.project import WBSItem, TeamMember
from app.services.requirement_extractor import RequirementExtractor

router = APIRouter()

# Pydantic 모델들
class WBSItemCreate(BaseModel):
    project_id: int
    parent_id: int = None
    title: str
    description: str = None
    level: int = 1
    order: int = 0
    estimated_hours: int = None
    assigned_to: str = None
    skill_level_required: str = None

class WBSItemResponse(BaseModel):
    id: int
    project_id: int
    parent_id: int = None
    title: str
    description: str = None
    level: int
    order: int
    estimated_hours: int = None
    assigned_to: str = None
    skill_level_required: str = None
    status: str
    
    class Config:
        from_attributes = True

class TeamMemberCreate(BaseModel):
    name: str
    email: str
    experience_years: int = None
    skill_level: str = None
    skills: List[str] = []
    availability: bool = True

class TeamMemberResponse(BaseModel):
    id: int
    name: str
    email: str
    experience_years: int = None
    skill_level: str = None
    skills: List[str] = []
    availability: bool
    
    class Config:
        from_attributes = True

class WBSGenerationRequest(BaseModel):
    project_id: int
    proposal_text: str
    rfp_text: str
    project_goals: str
    team_members: List[dict]

@router.post("/items", response_model=WBSItemResponse)
async def create_wbs_item(item: WBSItemCreate, db: Session = Depends(get_db)):
    """새 WBS 아이템 생성"""
    db_item = WBSItem(
        project_id=item.project_id,
        parent_id=item.parent_id,
        title=item.title,
        description=item.description,
        level=item.level,
        order=item.order,
        estimated_hours=item.estimated_hours,
        assigned_to=item.assigned_to,
        skill_level_required=item.skill_level_required
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/items", response_model=List[WBSItemResponse])
async def get_wbs_items(db: Session = Depends(get_db)):
    """WBS 아이템 목록 조회"""
    items = db.query(WBSItem).all()
    return items

@router.get("/items/project/{project_id}", response_model=List[WBSItemResponse])
async def get_project_wbs_items(project_id: int, db: Session = Depends(get_db)):
    """특정 프로젝트의 WBS 아이템 목록 조회"""
    items = db.query(WBSItem).filter(WBSItem.project_id == project_id).all()
    return items

@router.post("/team-members", response_model=TeamMemberResponse)
async def create_team_member(member: TeamMemberCreate, db: Session = Depends(get_db)):
    """새 팀 멤버 생성"""
    db_member = TeamMember(
        name=member.name,
        email=member.email,
        experience_years=member.experience_years,
        skill_level=member.skill_level,
        skills=member.skills,
        availability=member.availability
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/team-members", response_model=List[TeamMemberResponse])
async def get_team_members(db: Session = Depends(get_db)):
    """팀 멤버 목록 조회"""
    members = db.query(TeamMember).all()
    return members

@router.post("/generate")
async def generate_wbs(request: WBSGenerationRequest):
    """WBS 자동 생성"""
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
