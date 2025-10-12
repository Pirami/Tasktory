"""
문서 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.project import Document

router = APIRouter()

# Pydantic 모델들
class DocumentCreate(BaseModel):
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    title: str
    type: str
    description: str = ""
    file_path: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    title: str
    document_type: str
    description: str = ""
    content: Optional[str] = None
    file_path: Optional[str] = None
    status: str
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        data = {
            'id': obj.id,
            'project_id': obj.project_id,
            'project_name': obj.project_name,
            'title': obj.title,
            'document_type': obj.document_type,
            'description': obj.description or "",
            'content': obj.content,
            'file_path': obj.file_path,
            'status': obj.status,
            'created_at': obj.created_at.isoformat() if obj.created_at else None
        }
        return cls(**data)

class FileUploadResponse(BaseModel):
    file_path: str
    file_name: str
    file_size: int

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """파일 업로드"""
    # 파일 확장자 검증
    allowed_extensions = {'.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.xls'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"지원하지 않는 파일 형식입니다. 지원 형식: {', '.join(allowed_extensions)}"
        )
    
    # 파일 크기 제한 (10MB)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기는 10MB를 초과할 수 없습니다.")
    
    # 업로드 디렉토리 생성
    upload_dir = "uploads/documents"
    os.makedirs(upload_dir, exist_ok=True)
    
    # 고유한 파일명 생성
    file_id = str(uuid.uuid4())
    file_name = f"{file_id}_{file.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    # 파일 저장
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return FileUploadResponse(
            file_path=file_path,
            file_name=file.filename,
            file_size=len(content)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")

@router.post("/", response_model=DocumentResponse)
async def create_document(document: DocumentCreate, db: Session = Depends(get_db)):
    """새 문서 생성"""
    try:
        db_document = Document(
            project_id=document.project_id,
            project_name=document.project_name,
            title=document.title,
            document_type=document.type,
            description=document.description,
            file_path=document.file_path,
            status="draft" if not document.file_path else "completed"
        )
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        return DocumentResponse.from_orm(db_document)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"문서 생성 실패: {str(e)}")

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(db: Session = Depends(get_db)):
    """문서 목록 조회"""
    documents = db.query(Document).all()
    return [DocumentResponse.from_orm(doc) for doc in documents]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """특정 문서 조회"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다")
    return DocumentResponse.from_orm(document)

@router.get("/project/{project_id}", response_model=List[DocumentResponse])
async def get_project_documents(project_id: int, db: Session = Depends(get_db)):
    """특정 프로젝트의 문서 목록 조회"""
    documents = db.query(Document).filter(Document.project_id == project_id).all()
    return [DocumentResponse.from_orm(doc) for doc in documents]

@router.get("/{document_id}/content")
async def get_document_content(document_id: int, db: Session = Depends(get_db)):
    """문서 내용 조회"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
    
    # 문서에 저장된 내용이 있는 경우
    if document.content:
        return {"content": document.content}
    
    # 파일이 첨부된 경우 파일 내용 읽기
    if document.file_path and os.path.exists(document.file_path):
        try:
            with open(document.file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {"content": content}
        except UnicodeDecodeError:
            # 바이너리 파일인 경우
            return {"content": f"파일 경로: {document.file_path}\n\n이 파일은 바이너리 파일로 내용을 직접 표시할 수 없습니다."}
        except Exception as e:
            return {"content": f"파일을 읽는 중 오류가 발생했습니다: {str(e)}"}
    
    # 내용이 없는 경우
    return {"content": "문서 내용이 없습니다."}

@router.get("/{document_id}/download")
async def download_document_file(document_id: int, db: Session = Depends(get_db)):
    """문서 첨부파일 다운로드"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
    
    if not document.file_path or not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="첨부파일을 찾을 수 없습니다.")
    
    # 파일명 추출
    filename = os.path.basename(document.file_path)
    
    return FileResponse(
        path=document.file_path,
        filename=filename,
        media_type='application/octet-stream'
    )

@router.post("/generate")
async def generate_documents():
    """설계문서 자동 생성 (임시 구현)"""
    return {"message": "문서 자동 생성 기능은 추후 구현 예정입니다."}
