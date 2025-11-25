"""
팀원 관리 모델
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class TeamMember(Base):
    """팀원 모델"""
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    position = Column(String(100), nullable=False)  # 직책
    department = Column(String(100), nullable=True)  # 부서
    experience_years = Column(Integer, default=0)  # 경력 년수
    skills = Column(Text, nullable=True)  # 기술 스택 (JSON 문자열)
    skill_level = Column(String(20), default="Junior")  # Junior, Mid, Senior
    availability = Column(Boolean, default=True)  # 프로젝트 참여 가능 여부
    hourly_rate = Column(Integer, nullable=True)  # 시간당 비용 (선택사항)
    notes = Column(Text, nullable=True)  # 메모
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계
    project_memberships = relationship("ProjectMember", back_populates="team_member")

class ProjectMember(Base):
    """프로젝트 멤버 모델"""
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    team_member_id = Column(Integer, ForeignKey("team_members.id"), nullable=False)
    role = Column(String(100), nullable=False)  # 프로젝트 내 역할
    responsibility = Column(Text, nullable=True)  # 담당 업무
    allocation_percentage = Column(Integer, default=100)  # 할당 비율 (0-100)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계
    team_member = relationship("TeamMember", back_populates="project_memberships")

class ProjectTemplate(Base):
    """프로젝트 템플릿 모델"""
    __tablename__ = "project_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # 웹개발, 모바일, AI, 등
    estimated_duration = Column(Integer, nullable=True)  # 예상 기간 (일)
    required_skills = Column(Text, nullable=True)  # 필요 기술 스택 (JSON)
    team_size = Column(Integer, default=1)
    template_data = Column(Text, nullable=True)  # 템플릿 데이터 (JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
