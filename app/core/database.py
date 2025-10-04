"""
데이터베이스 설정 및 연결 관리
"""
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# 데이터베이스 엔진 생성
engine = create_engine(settings.database_url)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 베이스 클래스
Base = declarative_base()

# 메타데이터
metadata = MetaData()

async def init_db():
    """데이터베이스 초기화"""
    # 모든 모델 임포트 (테이블 생성을 위해)
    from app.models.project import Project, WBSItem, Meeting, Document
    from app.models.team import TeamMember, ProjectMember, ProjectTemplate
    
    # 모든 테이블 생성
    Base.metadata.create_all(bind=engine)

def get_db():
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
