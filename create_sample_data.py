#!/usr/bin/env python3
"""
샘플 데이터 생성 스크립트
팀원 관리 및 프로젝트 템플릿 샘플 데이터를 생성합니다.
"""
import asyncio
import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.models.team import TeamMember, ProjectTemplate

async def create_sample_data():
    """샘플 데이터 생성"""
    await init_db()
    
    db = SessionLocal()
    
    try:
        # 기존 데이터 확인
        existing_members = db.query(TeamMember).count()
        existing_templates = db.query(ProjectTemplate).count()
        
        if existing_members > 0:
            print(f"이미 {existing_members}명의 팀원이 있습니다.")
        else:
            # 샘플 팀원 데이터
            sample_members = [
                {
                    "name": "김현민",
                    "email": "hyunmin.kim@company.com",
                    "position": "시니어 개발자",
                    "department": "개발팀",
                    "experience_years": 5,
                    "skills": ["Python", "Kubernetes", "MLflow", "Docker", "AWS"],
                    "skill_level": "Senior",
                    "availability": True,
                    "hourly_rate": 80000,
                    "notes": "MLOps 전문가, 클라우드 아키텍처 경험 풍부"
                },
                {
                    "name": "이지훈",
                    "email": "jihun.lee@company.com",
                    "position": "풀스택 개발자",
                    "department": "개발팀",
                    "experience_years": 3,
                    "skills": ["React", "Node.js", "REST API", "JavaScript", "TypeScript"],
                    "skill_level": "Mid",
                    "availability": True,
                    "hourly_rate": 60000,
                    "notes": "프론트엔드-백엔드 연동 전문가"
                },
                {
                    "name": "박소연",
                    "email": "soyeon.park@company.com",
                    "position": "주니어 개발자",
                    "department": "개발팀",
                    "experience_years": 2,
                    "skills": ["Python", "FastAPI", "Docker", "SQL", "Git"],
                    "skill_level": "Junior",
                    "availability": True,
                    "hourly_rate": 40000,
                    "notes": "성장 가능성이 높은 신입 개발자"
                },
                {
                    "name": "정민수",
                    "email": "minsu.jung@company.com",
                    "position": "DevOps 엔지니어",
                    "department": "DevOps팀",
                    "experience_years": 4,
                    "skills": ["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS"],
                    "skill_level": "Senior",
                    "availability": True,
                    "hourly_rate": 75000,
                    "notes": "CI/CD 파이프라인 구축 전문가"
                },
                {
                    "name": "최유진",
                    "email": "yujin.choi@company.com",
                    "position": "QA 엔지니어",
                    "department": "QA팀",
                    "experience_years": 3,
                    "skills": ["Selenium", "Jest", "Postman", "Test Automation", "Python"],
                    "skill_level": "Mid",
                    "availability": True,
                    "hourly_rate": 55000,
                    "notes": "자동화 테스트 전문가"
                },
                {
                    "name": "한승우",
                    "email": "seungwoo.han@company.com",
                    "position": "프로젝트 매니저",
                    "department": "기획팀",
                    "experience_years": 6,
                    "skills": ["Project Management", "Agile", "Scrum", "Jira", "Confluence"],
                    "skill_level": "Senior",
                    "availability": True,
                    "hourly_rate": 90000,
                    "notes": "애자일 방법론 전문가, 팀 리딩 경험 풍부"
                }
            ]
            
            # 팀원 추가
            for member_data in sample_members:
                member = TeamMember(
                    name=member_data["name"],
                    email=member_data["email"],
                    position=member_data["position"],
                    department=member_data["department"],
                    experience_years=member_data["experience_years"],
                    skills=json.dumps(member_data["skills"]),
                    skill_level=member_data["skill_level"],
                    availability=member_data["availability"],
                    hourly_rate=member_data["hourly_rate"],
                    notes=member_data["notes"]
                )
                db.add(member)
            
            print(f"✅ {len(sample_members)}명의 샘플 팀원이 추가되었습니다.")
        
        if existing_templates > 0:
            print(f"이미 {existing_templates}개의 프로젝트 템플릿이 있습니다.")
        else:
            # 샘플 프로젝트 템플릿 데이터
            sample_templates = [
                {
                    "name": "웹 애플리케이션 개발",
                    "description": "React + Node.js 기반 풀스택 웹 애플리케이션 개발 템플릿",
                    "category": "웹개발",
                    "estimated_duration": 90,
                    "required_skills": ["React", "Node.js", "JavaScript", "SQL", "Git"],
                    "team_size": 3,
                    "template_data": {
                        "phases": [
                            {"name": "기획 및 설계", "duration": 15},
                            {"name": "프론트엔드 개발", "duration": 30},
                            {"name": "백엔드 개발", "duration": 30},
                            {"name": "테스트 및 배포", "duration": 15}
                        ],
                        "deliverables": ["요구사항 명세서", "UI/UX 디자인", "프론트엔드", "백엔드 API", "테스트 보고서"]
                    }
                },
                {
                    "name": "AI/ML 플랫폼 구축",
                    "description": "머신러닝 모델 개발 및 배포를 위한 MLOps 플랫폼 구축 템플릿",
                    "category": "AI/ML",
                    "estimated_duration": 120,
                    "required_skills": ["Python", "Kubernetes", "MLflow", "Docker", "AWS"],
                    "team_size": 4,
                    "template_data": {
                        "phases": [
                            {"name": "데이터 분석 및 모델링", "duration": 40},
                            {"name": "MLOps 파이프라인 구축", "duration": 40},
                            {"name": "모델 배포 및 모니터링", "duration": 30},
                            {"name": "문서화 및 교육", "duration": 10}
                        ],
                        "deliverables": ["데이터 분석 보고서", "ML 모델", "MLOps 파이프라인", "모니터링 시스템", "운영 매뉴얼"]
                    }
                },
                {
                    "name": "모바일 앱 개발",
                    "description": "React Native 기반 크로스 플랫폼 모바일 앱 개발 템플릿",
                    "category": "모바일",
                    "estimated_duration": 75,
                    "required_skills": ["React Native", "JavaScript", "Firebase", "Git"],
                    "team_size": 2,
                    "template_data": {
                        "phases": [
                            {"name": "UI/UX 디자인", "duration": 15},
                            {"name": "앱 개발", "duration": 45},
                            {"name": "테스트 및 배포", "duration": 15}
                        ],
                        "deliverables": ["UI/UX 디자인", "모바일 앱", "테스트 보고서", "배포 가이드"]
                    }
                },
                {
                    "name": "클라우드 마이그레이션",
                    "description": "온프레미스 시스템을 클라우드로 마이그레이션하는 프로젝트 템플릿",
                    "category": "클라우드",
                    "estimated_duration": 100,
                    "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
                    "team_size": 3,
                    "template_data": {
                        "phases": [
                            {"name": "현재 시스템 분석", "duration": 20},
                            {"name": "클라우드 아키텍처 설계", "duration": 25},
                            {"name": "마이그레이션 실행", "duration": 40},
                            {"name": "테스트 및 최적화", "duration": 15}
                        ],
                        "deliverables": ["현황 분석서", "클라우드 아키텍처", "마이그레이션 계획", "운영 가이드"]
                    }
                }
            ]
            
            # 프로젝트 템플릿 추가
            for template_data in sample_templates:
                template = ProjectTemplate(
                    name=template_data["name"],
                    description=template_data["description"],
                    category=template_data["category"],
                    estimated_duration=template_data["estimated_duration"],
                    required_skills=json.dumps(template_data["required_skills"]),
                    team_size=template_data["team_size"],
                    template_data=json.dumps(template_data["template_data"])
                )
                db.add(template)
            
            print(f"✅ {len(sample_templates)}개의 샘플 프로젝트 템플릿이 추가되었습니다.")
        
        db.commit()
        print("🎉 샘플 데이터 생성이 완료되었습니다!")
        
    except Exception as e:
        print(f"❌ 샘플 데이터 생성 중 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 샘플 데이터 생성을 시작합니다...")
    asyncio.run(create_sample_data())
