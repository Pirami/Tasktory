#!/usr/bin/env python3
"""
Tasktory 시스템 초기화 및 샘플 데이터 생성 스크립트
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.append(str(Path(__file__).parent))

from app.core.database import engine, Base, get_db
from app.models.project import Project, WBSItem, Meeting, Document
from app.models.team import TeamMember, ProjectMember, ProjectTemplate
from sqlalchemy.orm import sessionmaker

async def create_tables():
    """데이터베이스 테이블 생성"""
    print("📊 데이터베이스 테이블 생성 중...")
    Base.metadata.create_all(bind=engine)
    print("✅ 데이터베이스 테이블 생성 완료")

async def create_sample_data():
    """샘플 데이터 생성"""
    print("📝 샘플 데이터 생성 중...")
    
    # 데이터베이스 세션 생성
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 기존 데이터 삭제 (순서 중요: 외래키 참조 순서대로)
        print("🗑️ 기존 데이터 삭제 중...")
        db.query(ProjectMember).delete()
        db.query(ProjectTemplate).delete()
        db.query(WBSItem).delete()
        db.query(Meeting).delete()
        db.query(Document).delete()
        db.query(Project).delete()
        db.query(TeamMember).delete()
        db.commit()
        
        # 팀원 데이터 생성
        print("👥 팀원 데이터 생성 중...")
        team_members = [
            TeamMember(
                name="김개발",
                email="kim.dev@company.com",
                position="시니어 개발자",
                skills='["Python", "FastAPI", "React", "PostgreSQL"]',
                experience_years=8,
                skill_level="Senior",
                availability=True,
                notes="풀스택 개발 전문가"
            ),
            TeamMember(
                name="이백엔드",
                email="lee.backend@company.com",
                position="백엔드 개발자",
                skills='["Python", "Django", "PostgreSQL", "Redis"]',
                experience_years=5,
                skill_level="Mid",
                availability=True,
                notes="백엔드 아키텍처 전문가"
            ),
            TeamMember(
                name="박프론트",
                email="park.frontend@company.com",
                position="프론트엔드 개발자",
                skills='["React", "JavaScript", "TypeScript", "CSS"]',
                experience_years=4,
                skill_level="Mid",
                availability=True,
                notes="사용자 인터페이스 전문가"
            ),
            TeamMember(
                name="최데이터",
                email="choi.data@company.com",
                position="데이터 분석가",
                skills='["Python", "Pandas", "SQL", "Machine Learning"]',
                experience_years=6,
                skill_level="Senior",
                availability=True,
                notes="데이터 분석 및 AI 전문가"
            ),
            TeamMember(
                name="정인프라",
                email="jung.infra@company.com",
                position="인프라 엔지니어",
                skills='["AWS", "Docker", "Kubernetes", "Linux"]',
                experience_years=7,
                skill_level="Senior",
                availability=True,
                notes="클라우드 인프라 전문가"
            )
        ]
        
        for member in team_members:
            db.add(member)
        db.commit()
        
        # 프로젝트 데이터 생성
        print("📋 프로젝트 데이터 생성 중...")
        projects = [
            Project(
                name="Tasktory 시스템 개발",
                description="AI 기반 프로젝트 관리 자동화 시스템",
                status="active",
                start_date=datetime.now() - timedelta(days=30),
                end_date=datetime.now() + timedelta(days=60)
            ),
            Project(
                name="고객 관리 시스템",
                description="CRM 시스템 개발",
                status="active",
                start_date=datetime.now() - timedelta(days=5),
                end_date=datetime.now() + timedelta(days=90)
            ),
            Project(
                name="데이터 분석 플랫폼",
                description="빅데이터 분석 플랫폼 구축",
                status="planning",
                start_date=datetime.now() + timedelta(days=10),
                end_date=datetime.now() + timedelta(days=120)
            )
        ]
        
        for project in projects:
            db.add(project)
        db.commit()
        
        # 프로젝트 멤버 할당
        print("🔗 프로젝트 멤버 할당 중...")
        project_members = [
            # Tasktory 시스템 개발 프로젝트
            ProjectMember(
                project_id=1, team_member_id=1, role="프로젝트 매니저", allocation_percentage=100,
                start_date=datetime.now() - timedelta(days=30), end_date=datetime.now() + timedelta(days=60),
                responsibility="전체 프로젝트 관리 및 일정 조율"
            ),
            ProjectMember(
                project_id=1, team_member_id=2, role="백엔드 개발자", allocation_percentage=100,
                start_date=datetime.now() - timedelta(days=25), end_date=datetime.now() + timedelta(days=50),
                responsibility="API 개발 및 데이터베이스 설계"
            ),
            ProjectMember(
                project_id=1, team_member_id=3, role="프론트엔드 개발자", allocation_percentage=100,
                start_date=datetime.now() - timedelta(days=20), end_date=datetime.now() + timedelta(days=45),
                responsibility="사용자 인터페이스 개발"
            ),
            ProjectMember(
                project_id=1, team_member_id=4, role="데이터 분석가", allocation_percentage=50,
                start_date=datetime.now() - timedelta(days=15), end_date=datetime.now() + timedelta(days=30),
                responsibility="데이터 분석 및 AI 모델 개발"
            ),
            ProjectMember(
                project_id=1, team_member_id=5, role="인프라 엔지니어", allocation_percentage=50,
                start_date=datetime.now() - timedelta(days=10), end_date=datetime.now() + timedelta(days=40),
                responsibility="서버 인프라 구축 및 배포"
            ),
            
            # 고객 관리 시스템 프로젝트
            ProjectMember(
                project_id=2, team_member_id=1, role="기술 리더", allocation_percentage=50,
                start_date=datetime.now() - timedelta(days=5), end_date=datetime.now() + timedelta(days=90),
                responsibility="기술 아키텍처 설계 및 코드 리뷰"
            ),
            ProjectMember(
                project_id=2, team_member_id=2, role="백엔드 개발자", allocation_percentage=100,
                start_date=datetime.now() - timedelta(days=3), end_date=datetime.now() + timedelta(days=80),
                responsibility="CRM 백엔드 API 개발"
            ),
            ProjectMember(
                project_id=2, team_member_id=3, role="프론트엔드 개발자", allocation_percentage=100,
                start_date=datetime.now() - timedelta(days=1), end_date=datetime.now() + timedelta(days=75),
                responsibility="CRM 관리자 대시보드 개발"
            ),
            ProjectMember(
                project_id=2, team_member_id=5, role="인프라 엔지니어", allocation_percentage=50,
                start_date=datetime.now(), end_date=datetime.now() + timedelta(days=85),
                responsibility="클라우드 인프라 구축"
            ),
            
            # 데이터 분석 플랫폼 프로젝트
            ProjectMember(
                project_id=3, team_member_id=1, role="프로젝트 매니저", allocation_percentage=50,
                start_date=datetime.now() + timedelta(days=10), end_date=datetime.now() + timedelta(days=120),
                responsibility="데이터 플랫폼 프로젝트 기획 및 관리"
            ),
            ProjectMember(
                project_id=3, team_member_id=4, role="데이터 분석가", allocation_percentage=100,
                start_date=datetime.now() + timedelta(days=15), end_date=datetime.now() + timedelta(days=110),
                responsibility="빅데이터 분석 플랫폼 설계 및 구현"
            ),
            ProjectMember(
                project_id=3, team_member_id=5, role="인프라 엔지니어", allocation_percentage=100,
                start_date=datetime.now() + timedelta(days=20), end_date=datetime.now() + timedelta(days=100),
                responsibility="대용량 데이터 처리 인프라 구축"
            ),
        ]
        
        for pm in project_members:
            db.add(pm)
        db.commit()
        
        # WBS 아이템 생성
        print("📊 WBS 아이템 생성 중...")
        wbs_items = [
            # Tasktory 시스템 개발 프로젝트 WBS
            WBSItem(
                project_id=1,
                title="요구사항 분석",
                description="프로젝트 요구사항 수집 및 분석",
                level=1,
                parent_id=None,
                status="completed",
                estimated_hours=40,
                assigned_to="김개발",
                skill_level_required="Senior"
            ),
            WBSItem(
                project_id=1,
                title="시스템 설계",
                description="전체 시스템 아키텍처 설계",
                level=1,
                parent_id=None,
                status="in_progress",
                estimated_hours=60,
                assigned_to="김개발",
                skill_level_required="Senior"
            ),
            WBSItem(
                project_id=1,
                title="백엔드 개발",
                description="FastAPI 기반 백엔드 API 개발",
                level=1,
                parent_id=None,
                status="pending",
                estimated_hours=120,
                assigned_to="이백엔드",
                skill_level_required="Mid"
            ),
            WBSItem(
                project_id=1,
                title="프론트엔드 개발",
                description="React 기반 프론트엔드 개발",
                level=1,
                parent_id=None,
                status="pending",
                estimated_hours=100,
                assigned_to="박프론트",
                skill_level_required="Mid"
            ),
            WBSItem(
                project_id=1,
                title="테스트 및 배포",
                description="시스템 테스트 및 배포",
                level=1,
                parent_id=None,
                status="pending",
                estimated_hours=40,
                assigned_to="김개발",
                skill_level_required="Senior"
            )
        ]
        
        for wbs in wbs_items:
            db.add(wbs)
        db.commit()
        
        # 미팅 데이터 생성
        print("📅 미팅 데이터 생성 중...")
        meetings = [
            Meeting(
                project_id=1,
                title="프로젝트 킥오프 미팅",
                description="프로젝트 시작 및 역할 분담",
                meeting_date=datetime.now() - timedelta(days=15),
                participants=["김개발", "이백엔드", "박프론트", "최데이터", "정인프라"],
                summary="프로젝트 목표 및 일정 논의"
            ),
            Meeting(
                project_id=1,
                title="요구사항 검토 미팅",
                description="요구사항 문서 검토 및 승인",
                meeting_date=datetime.now() - timedelta(days=5),
                participants=["김개발", "이백엔드", "박프론트"],
                summary="요구사항 승인 및 다음 단계 논의"
            ),
            Meeting(
                project_id=1,
                title="시스템 설계 리뷰",
                description="시스템 아키텍처 설계 검토",
                meeting_date=datetime.now() + timedelta(days=5),
                participants=["김개발", "이백엔드", "정인프라"],
                summary="시스템 아키텍처 검토 및 승인"
            )
        ]
        
        for meeting in meetings:
            db.add(meeting)
        db.commit()
        
        # 문서 데이터 생성
        print("📄 문서 데이터 생성 중...")
        documents = [
            Document(
                project_id=1,
                title="요구사항 명세서",
                description="프로젝트 요구사항 상세 명세",
                document_type="requirements",
                file_path="/documents/requirements.pdf",
                content="프로젝트 요구사항 상세 명세 내용..."
            ),
            Document(
                project_id=1,
                title="시스템 설계서",
                description="시스템 아키텍처 설계 문서",
                document_type="design",
                file_path="/documents/design.pdf",
                content="시스템 아키텍처 설계 문서 내용..."
            ),
            Document(
                project_id=1,
                title="프로젝트 계획서",
                description="프로젝트 일정 및 리소스 계획",
                document_type="plan",
                file_path="/documents/plan.xlsx",
                content="프로젝트 일정 및 리소스 계획 내용..."
            )
        ]
        
        for doc in documents:
            db.add(doc)
        db.commit()
        
        print("✅ 샘플 데이터 생성 완료!")
        print(f"📊 생성된 데이터:")
        print(f"   - 팀원: {len(team_members)}명")
        print(f"   - 프로젝트: {len(projects)}개")
        print(f"   - 프로젝트 멤버: {len(project_members)}개")
        print(f"   - WBS 아이템: {len(wbs_items)}개")
        print(f"   - 미팅: {len(meetings)}개")
        print(f"   - 문서: {len(documents)}개")
        
    except Exception as e:
        print(f"❌ 샘플 데이터 생성 실패: {e}")
        db.rollback()
        raise
    finally:
        db.close()

async def main():
    """메인 함수"""
    print("🚀 Tasktory 시스템 초기화 시작")
    print("=" * 50)
    
    try:
        # 1. 데이터베이스 테이블 생성
        await create_tables()
        
        # 2. 샘플 데이터 생성
        await create_sample_data()
        
        print("=" * 50)
        print("🎉 Tasktory 시스템 초기화 완료!")
        print("📝 다음 단계:")
        print("   1. 백엔드 서버 시작: source venv/bin/activate && PYTHONPATH=. python app/main.py")
        print("   2. 프론트엔드 시작: cd frontend && npm start")
        print("   3. 브라우저에서 http://localhost:3000 접속")
        
    except Exception as e:
        print(f"❌ 초기화 실패: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())