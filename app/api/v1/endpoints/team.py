"""
팀원 관리 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json

from app.core.database import get_db
from app.models.team import TeamMember, ProjectMember, ProjectTemplate
from app.models.project import Project

router = APIRouter()

# Pydantic 모델들
class TeamMemberCreate(BaseModel):
    name: str
    email: EmailStr
    position: str
    department: Optional[str] = None
    experience_years: int = 0
    skills: Optional[List[str]] = None
    skill_level: str = "Junior"
    availability: bool = True
    hourly_rate: Optional[int] = None
    notes: Optional[str] = None

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    position: Optional[str] = None
    department: Optional[str] = None
    experience_years: Optional[int] = None
    skills: Optional[List[str]] = None
    skill_level: Optional[str] = None
    availability: Optional[bool] = None
    hourly_rate: Optional[int] = None
    notes: Optional[str] = None

class TeamMemberResponse(BaseModel):
    id: int
    name: str
    email: str
    position: str
    department: Optional[str]
    experience_years: int
    skills: Optional[List[str]]
    skill_level: str
    availability: bool
    hourly_rate: Optional[int]
    notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ProjectMemberCreate(BaseModel):
    project_id: int
    team_member_id: int
    role: str
    responsibility: Optional[str] = None
    allocation_percentage: int = 100
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    team_member_id: int
    role: str
    responsibility: Optional[str]
    allocation_percentage: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    team_member: TeamMemberResponse

    class Config:
        from_attributes = True

class ProjectTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    estimated_duration: Optional[int] = None
    required_skills: Optional[List[str]] = None
    team_size: int = 1
    template_data: Optional[dict] = None

class ProjectTemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    estimated_duration: Optional[int]
    required_skills: Optional[List[str]]
    team_size: int
    template_data: Optional[dict]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# 팀원 관리 엔드포인트
@router.get("/team-members", response_model=List[TeamMemberResponse])
async def get_team_members(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    skill_level: Optional[str] = None,
    availability: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """팀원 목록 조회"""
    query = db.query(TeamMember)
    
    if department:
        query = query.filter(TeamMember.department == department)
    if skill_level:
        query = query.filter(TeamMember.skill_level == skill_level)
    if availability is not None:
        query = query.filter(TeamMember.availability == availability)
    
    team_members = query.offset(skip).limit(limit).all()
    
    # skills를 JSON 문자열에서 리스트로 변환
    for member in team_members:
        if member.skills:
            try:
                member.skills = json.loads(member.skills)
            except:
                member.skills = []
        else:
            member.skills = []
    
    return team_members

@router.post("/team-members", response_model=TeamMemberResponse)
async def create_team_member(
    team_member: TeamMemberCreate,
    db: Session = Depends(get_db)
):
    """새 팀원 추가"""
    # 이메일 중복 확인
    existing_member = db.query(TeamMember).filter(TeamMember.email == team_member.email).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")
    
    # skills를 JSON 문자열로 변환
    skills_json = json.dumps(team_member.skills) if team_member.skills else None
    
    db_member = TeamMember(
        name=team_member.name,
        email=team_member.email,
        position=team_member.position,
        department=team_member.department,
        experience_years=team_member.experience_years,
        skills=skills_json,
        skill_level=team_member.skill_level,
        availability=team_member.availability,
        hourly_rate=team_member.hourly_rate,
        notes=team_member.notes
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    # skills를 리스트로 변환하여 반환
    if db_member.skills:
        db_member.skills = json.loads(db_member.skills)
    else:
        db_member.skills = []
    
    return db_member

@router.get("/team-members/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(member_id: int, db: Session = Depends(get_db)):
    """특정 팀원 조회"""
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="팀원을 찾을 수 없습니다")
    
    # skills를 리스트로 변환
    if member.skills:
        member.skills = json.loads(member.skills)
    else:
        member.skills = []
    
    return member

@router.put("/team-members/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: int,
    team_member: TeamMemberUpdate,
    db: Session = Depends(get_db)
):
    """팀원 정보 수정"""
    db_member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="팀원을 찾을 수 없습니다")
    
    # 이메일 중복 확인 (자신 제외)
    if team_member.email:
        existing_member = db.query(TeamMember).filter(
            TeamMember.email == team_member.email,
            TeamMember.id != member_id
        ).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")
    
    # 업데이트할 필드들
    update_data = team_member.dict(exclude_unset=True)
    
    # skills를 JSON 문자열로 변환
    if "skills" in update_data:
        update_data["skills"] = json.dumps(update_data["skills"]) if update_data["skills"] else None
    
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db.commit()
    db.refresh(db_member)
    
    # skills를 리스트로 변환하여 반환
    if db_member.skills:
        db_member.skills = json.loads(db_member.skills)
    else:
        db_member.skills = []
    
    return db_member

@router.delete("/team-members/{member_id}")
async def delete_team_member(member_id: int, db: Session = Depends(get_db)):
    """팀원 삭제"""
    member = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="팀원을 찾을 수 없습니다")
    
    # 프로젝트 멤버십이 있는지 확인
    project_memberships = db.query(ProjectMember).filter(
        ProjectMember.team_member_id == member_id,
        ProjectMember.is_active == True
    ).count()
    
    if project_memberships > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"활성 프로젝트 멤버십이 {project_memberships}개 있습니다. 먼저 프로젝트에서 제거해주세요."
        )
    
    db.delete(member)
    db.commit()
    
    return {"message": "팀원이 삭제되었습니다"}

# 프로젝트 멤버 관리 엔드포인트
@router.get("/projects/{project_id}/members", response_model=List[ProjectMemberResponse])
async def get_project_members(project_id: int, db: Session = Depends(get_db)):
    """프로젝트 멤버 목록 조회"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.is_active == True
    ).all()
    
    # 각 멤버의 skills를 리스트로 변환
    for member in members:
        if member.team_member.skills:
            member.team_member.skills = json.loads(member.team_member.skills)
        else:
            member.team_member.skills = []
    
    return members

@router.post("/projects/{project_id}/members", response_model=ProjectMemberResponse)
async def add_project_member(
    project_id: int,
    project_member: ProjectMemberCreate,
    db: Session = Depends(get_db)
):
    """프로젝트에 멤버 추가"""
    # 프로젝트 존재 확인
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    # 팀원 존재 확인
    team_member = db.query(TeamMember).filter(TeamMember.id == project_member.team_member_id).first()
    if not team_member:
        raise HTTPException(status_code=404, detail="팀원을 찾을 수 없습니다")
    
    # 이미 프로젝트 멤버인지 확인
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.team_member_id == project_member.team_member_id,
        ProjectMember.is_active == True
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="이미 프로젝트 멤버입니다")
    
    db_member = ProjectMember(
        project_id=project_id,
        team_member_id=project_member.team_member_id,
        role=project_member.role,
        responsibility=project_member.responsibility,
        allocation_percentage=project_member.allocation_percentage,
        start_date=project_member.start_date,
        end_date=project_member.end_date
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    # skills를 리스트로 변환
    if db_member.team_member.skills:
        db_member.team_member.skills = json.loads(db_member.team_member.skills)
    else:
        db_member.team_member.skills = []
    
    return db_member

@router.delete("/projects/{project_id}/members/{member_id}")
async def remove_project_member(
    project_id: int,
    member_id: int,
    db: Session = Depends(get_db)
):
    """프로젝트에서 멤버 제거"""
    project_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.id == member_id
    ).first()
    
    if not project_member:
        raise HTTPException(status_code=404, detail="프로젝트 멤버를 찾을 수 없습니다")
    
    project_member.is_active = False
    db.commit()
    
    return {"message": "프로젝트에서 멤버가 제거되었습니다"}

# 프로젝트 템플릿 관리 엔드포인트
@router.get("/project-templates", response_model=List[ProjectTemplateResponse])
async def get_project_templates(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """프로젝트 템플릿 목록 조회"""
    query = db.query(ProjectTemplate).filter(ProjectTemplate.is_active == True)
    
    if category:
        query = query.filter(ProjectTemplate.category == category)
    
    templates = query.all()
    
    # 각 템플릿의 데이터를 파싱
    for template in templates:
        if template.required_skills:
            template.required_skills = json.loads(template.required_skills)
        else:
            template.required_skills = []
        
        if template.template_data:
            template.template_data = json.loads(template.template_data)
        else:
            template.template_data = {}
    
    return templates

@router.post("/project-templates", response_model=ProjectTemplateResponse)
async def create_project_template(
    template: ProjectTemplateCreate,
    db: Session = Depends(get_db)
):
    """새 프로젝트 템플릿 생성"""
    db_template = ProjectTemplate(
        name=template.name,
        description=template.description,
        category=template.category,
        estimated_duration=template.estimated_duration,
        required_skills=json.dumps(template.required_skills) if template.required_skills else None,
        team_size=template.team_size,
        template_data=json.dumps(template.template_data) if template.template_data else None
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    # 데이터를 파싱하여 반환
    if db_template.required_skills:
        db_template.required_skills = json.loads(db_template.required_skills)
    else:
        db_template.required_skills = []
    
    if db_template.template_data:
        db_template.template_data = json.loads(db_template.template_data)
    else:
        db_template.template_data = {}
    
    return db_template

# 빠른 작업을 위한 엔드포인트
@router.post("/quick-create-project")
async def quick_create_project(
    template_id: int,
    project_name: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """템플릿을 사용한 빠른 프로젝트 생성"""
    template = db.query(ProjectTemplate).filter(ProjectTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")
    
    # 새 프로젝트 생성
    project = Project(
        name=project_name,
        description=description or template.description,
        status="planning"
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return {
        "message": "프로젝트가 생성되었습니다",
        "project_id": project.id,
        "project_name": project.name,
        "template_used": template.name
    }
