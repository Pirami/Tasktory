"""
회의 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.project import Meeting
from app.services.meeting_processor import MeetingProcessor

router = APIRouter()

# Pydantic 모델들
class MeetingCreate(BaseModel):
    project_id: int
    title: str
    description: str
    meeting_date: datetime
    participants: List[str]

class MeetingResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    meeting_date: datetime
    participants: List[str]
    transcript: str = None
    summary: str = None
    
    class Config:
        from_attributes = True

class MeetingProcessingRequest(BaseModel):
    meeting_id: int
    rfp_content: str
    project_scope: str
    pm_email: str

@router.post("/", response_model=MeetingResponse)
async def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    """새 회의 생성"""
    db_meeting = Meeting(
        project_id=meeting.project_id,
        title=meeting.title,
        description=meeting.description,
        meeting_date=meeting.meeting_date,
        participants=meeting.participants
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@router.get("/", response_model=List[MeetingResponse])
async def get_meetings(db: Session = Depends(get_db)):
    """회의 목록 조회"""
    meetings = db.query(Meeting).all()
    return meetings

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """특정 회의 조회"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="회의를 찾을 수 없습니다")
    return meeting

@router.post("/upload-audio/{meeting_id}")
async def upload_meeting_audio(
    meeting_id: int,
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """회의 녹음 파일 업로드"""
    try:
        # 파일 저장 경로 설정
        file_path = f"uploads/meetings/{meeting_id}_{audio_file.filename}"
        
        # 파일 저장
        with open(file_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        # 데이터베이스 업데이트
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if meeting:
            meeting.audio_file_path = file_path
            db.commit()
        
        return {"message": "파일이 성공적으로 업로드되었습니다", "file_path": file_path}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")

@router.post("/process/{meeting_id}")
async def process_meeting(
    meeting_id: int,
    request: MeetingProcessingRequest,
    db: Session = Depends(get_db)
):
    """회의 녹음 처리"""
    try:
        # 회의 정보 조회
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise HTTPException(status_code=404, detail="회의를 찾을 수 없습니다")
        
        if not meeting.audio_file_path:
            raise HTTPException(status_code=400, detail="회의 녹음 파일이 없습니다")
        
        # 간단한 회의 처리 (실제 구현에서는 AI 서비스 연동)
        # TODO: 실제 음성 인식 및 회의록 생성 로직 구현
        
        # 임시 결과 생성
        result = {
            "status": "success",
            "transcript": "회의 녹음 파일이 처리되었습니다. (실제 구현 필요)",
            "summary": {
                "summary": "회의 요약이 생성되었습니다. (실제 구현 필요)",
                "action_items": ["액션 아이템 1", "액션 아이템 2"]
            },
            "scope_deviation": False,
            "alerts_sent": []
        }
        
        # 결과를 데이터베이스에 저장
        meeting.transcript = result.get("transcript", "")
        meeting.summary = result.get("summary", {}).get("summary", "")
        meeting.action_items = result.get("summary", {}).get("action_items", [])
        db.commit()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
