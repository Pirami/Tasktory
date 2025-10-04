"""
문서 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.models.project import Document

router = APIRouter()

# Pydantic 모델들
class DocumentCreate(BaseModel):
    project_id: int
    title: str
    document_type: str
    content: str = None
    file_path: str = None

class DocumentResponse(BaseModel):
    id: int
    project_id: int
    title: str
    document_type: str
    content: str = None
    file_path: str = None
    status: str
    
    class Config:
        from_attributes = True

class DocumentGenerationRequest(BaseModel):
    project_id: int
    proposal_text: str
    rfp_text: str
    requirements_doc: str

@router.post("/", response_model=DocumentResponse)
async def create_document(document: DocumentCreate, db: Session = Depends(get_db)):
    """새 문서 생성"""
    db_document = Document(
        project_id=document.project_id,
        title=document.title,
        document_type=document.document_type,
        content=document.content,
        file_path=document.file_path
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(db: Session = Depends(get_db)):
    """문서 목록 조회"""
    documents = db.query(Document).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """특정 문서 조회"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다")
    return document

@router.get("/project/{project_id}", response_model=List[DocumentResponse])
async def get_project_documents(project_id: int, db: Session = Depends(get_db)):
    """특정 프로젝트의 문서 목록 조회"""
    documents = db.query(Document).filter(Document.project_id == project_id).all()
    return documents

@router.post("/generate")
async def generate_documents(request: DocumentGenerationRequest):
    """설계문서 자동 생성"""
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
