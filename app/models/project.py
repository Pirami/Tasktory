"""
프로젝트 관련 데이터 모델
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Project(Base):
    """프로젝트 모델"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="planning")  # planning, active, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    wbs_items = relationship("WBSItem", back_populates="project")
    meetings = relationship("Meeting", back_populates="project")
    documents = relationship("Document", back_populates="project")
    members = relationship("ProjectMember", back_populates="project")

class WBSItem(Base):
    """WBS(Work Breakdown Structure) 아이템 모델"""
    __tablename__ = "wbs_items"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    parent_id = Column(Integer, ForeignKey("wbs_items.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    level = Column(Integer, default=1)
    order = Column(Integer, default=0)
    estimated_hours = Column(Integer)
    assigned_to = Column(String(100))
    skill_level_required = Column(String(50))  # junior, mid, senior, expert
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계
    project = relationship("Project", back_populates="wbs_items")
    parent = relationship("WBSItem", remote_side=[id])
    children = relationship("WBSItem", back_populates="parent")

class Meeting(Base):
    """회의 모델"""
    __tablename__ = "meetings"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    meeting_date = Column(DateTime)
    participants = Column(JSON)  # 참석자 리스트
    audio_file_path = Column(String(500))
    transcript = Column(Text)
    summary = Column(Text)
    action_items = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계
    project = relationship("Project", back_populates="meetings")

class Document(Base):
    """문서 모델"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    title = Column(String(255), nullable=False)
    document_type = Column(String(100))  # proposal, rfp, design, manual, etc.
    content = Column(Text)
    file_path = Column(String(500))
    status = Column(String(50), default="draft")  # draft, review, approved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    project = relationship("Project", back_populates="documents")
