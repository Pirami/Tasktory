#!/usr/bin/env python3
"""
고도화된 WBS 생성 테스트 스크립트
"""
import asyncio
import requests
import json
from typing import Dict, Any

def test_enhanced_wbs_generation(base_url: str = "http://localhost:8000") -> bool:
    """고도화된 WBS 생성 테스트"""
    try:
        test_data = {
            "project_id": 1,
            "proposal_content": """
            AI 기반 데이터 분석 플랫폼 개발 제안서
            
            본 프로젝트는 기업의 데이터를 실시간으로 분석하고 
            인사이트를 제공하는 클라우드 기반 플랫폼을 개발합니다.
            
            주요 기능:
            - 실시간 데이터 스트리밍 처리
            - 머신러닝 모델 자동 학습 및 배포
            - 대화형 데이터 시각화 대시보드
            - RESTful API 제공
            - 다중 클라우드 지원 (AWS, Azure, GCP)
            """,
            "rfp_content": """
            데이터 분석 플랫폼 RFP
            
            요구사항:
            1. 실시간 데이터 처리 (Kafka, Spark Streaming)
            2. 머신러닝 모델 통합 (TensorFlow, PyTorch)
            3. 웹 기반 대시보드 (React, D3.js)
            4. RESTful API (FastAPI, GraphQL)
            5. 데이터 시각화 (Plotly, Tableau 연동)
            6. 보안 및 인증 (OAuth2, JWT)
            7. 모니터링 및 로깅 (Prometheus, Grafana)
            8. 컨테이너화 (Docker, Kubernetes)
            """,
            "project_goals": """
            프로젝트 목표:
            1. 데이터 처리 성능 향상 50% (기존 대비)
            2. 분석 시간 단축 70% (실시간 처리)
            3. 사용자 만족도 95% 이상
            4. 시스템 안정성 99.9% 달성
            5. 확장성: 100만 건/일 처리 가능
            6. 보안: SOC2 Type II 준수
            """,
            "team_members": [
                {
                    "name": "김현민",
                    "experience_years": 5,
                    "skills": ["Python", "Kubernetes", "MLflow", "Docker", "AWS", "TensorFlow"],
                    "skill_level": "Senior",
                    "department": "개발팀",
                    "hourly_rate": 80000
                },
                {
                    "name": "이지훈",
                    "experience_years": 3,
                    "skills": ["React", "Node.js", "REST API", "JavaScript", "TypeScript", "D3.js"],
                    "skill_level": "Mid",
                    "department": "개발팀",
                    "hourly_rate": 60000
                },
                {
                    "name": "박소연",
                    "experience_years": 2,
                    "skills": ["Python", "FastAPI", "Docker", "SQL", "Git", "PostgreSQL"],
                    "skill_level": "Junior",
                    "department": "개발팀",
                    "hourly_rate": 40000
                },
                {
                    "name": "정민수",
                    "experience_years": 4,
                    "skills": ["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS", "Prometheus"],
                    "skill_level": "Senior",
                    "department": "DevOps팀",
                    "hourly_rate": 75000
                },
                {
                    "name": "최유진",
                    "experience_years": 3,
                    "skills": ["Selenium", "Jest", "Postman", "Test Automation", "Python", "Cypress"],
                    "skill_level": "Mid",
                    "department": "QA팀",
                    "hourly_rate": 55000
                }
            ],
            "additional_files": [
                {
                    "filename": "기술_아키텍처_문서.md",
                    "content": """
                    # 기술 아키텍처 문서
                    
                    ## 시스템 아키텍처
                    - 마이크로서비스 아키텍처
                    - 이벤트 기반 아키텍처
                    - API Gateway 패턴
                    
                    ## 기술 스택
                    - Backend: Python, FastAPI, Celery
                    - Frontend: React, TypeScript, Material-UI
                    - Database: PostgreSQL, Redis, MongoDB
                    - Message Queue: Apache Kafka
                    - Container: Docker, Kubernetes
                    """
                },
                {
                    "filename": "보안_요구사항.md",
                    "content": """
                    # 보안 요구사항
                    
                    ## 인증 및 인가
                    - OAuth2.0 + JWT 토큰 기반 인증
                    - RBAC (Role-Based Access Control)
                    - API Rate Limiting
                    
                    ## 데이터 보안
                    - 데이터 암호화 (AES-256)
                    - 전송 암호화 (TLS 1.3)
                    - 개인정보 보호 (GDPR 준수)
                    """
                }
            ]
        }
        
        print("🚀 고도화된 WBS 생성 테스트 시작...")
        print(f"📊 테스트 데이터: {len(test_data['team_members'])}명의 팀원, {len(test_data['additional_files'])}개의 추가 파일")
        
        response = requests.post(
            f"{base_url}/api/v1/projects/generate-enhanced-wbs",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=180  # 3분 타임아웃
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 고도화된 WBS 생성 성공")
            print(f"   - 상태: {result.get('status', 'N/A')}")
            
            if result.get('status') == 'success':
                # 요구사항 분석 결과
                requirements = result.get('requirements_analysis', {})
                print(f"   - 프로젝트 복잡도: {requirements.get('project_complexity', 'N/A')}")
                print(f"   - 예상 기간: {requirements.get('estimated_duration_weeks', 0)}주")
                print(f"   - 비즈니스 요구사항: {len(requirements.get('business_requirements', []))}개")
                print(f"   - 기술적 요구사항: {len(requirements.get('technical_requirements', []))}개")
                
                # WBS 데이터
                wbs_data = result.get('wbs_data', {})
                phases = wbs_data.get('project_phases', [])
                print(f"   - 프로젝트 단계: {len(phases)}개")
                
                total_tasks = 0
                for phase in phases:
                    tasks = phase.get('tasks', [])
                    total_tasks += len(tasks)
                    print(f"     * {phase.get('phase_name', 'Unknown')}: {len(tasks)}개 작업 ({phase.get('duration_weeks', 0)}주)")
                
                print(f"   - 총 작업 수: {total_tasks}개")
                
                # 팀 할당 현황
                team_allocation = result.get('team_allocation', {})
                workload = team_allocation.get('workload_distribution', [])
                print(f"   - 할당된 팀원: {team_allocation.get('assigned_members', 0)}명")
                print(f"   - 미할당 작업: {team_allocation.get('unassigned_tasks', 0)}개")
                
                for member in workload:
                    if member.get('total_hours', 0) > 0:
                        print(f"     * {member.get('name', 'Unknown')}: {member.get('total_hours', 0)}시간, {member.get('utilization_rate', '0%')}")
                
                # 타임라인
                timeline = result.get('timeline', {})
                print(f"   - 전체 기간: {timeline.get('total_duration_weeks', 0)}주")
                
                return True
            else:
                print(f"   - 오류: {result.get('error', '알 수 없는 오류')}")
                return False
        else:
            print(f"❌ 고도화된 WBS 생성 실패: {response.status_code}")
            print(f"   응답: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ 고도화된 WBS 생성 타임아웃 (180초 초과)")
        return False
    except Exception as e:
        print(f"❌ 고도화된 WBS 생성 테스트 오류: {e}")
        return False

def main():
    """메인 실행 함수"""
    print("🎯 고도화된 WBS 생성 테스트")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # 서버 상태 확인
    try:
        health_response = requests.get(f"{base_url}/health", timeout=10)
        if health_response.status_code != 200:
            print("❌ 서버가 실행 중이지 않습니다.")
            return
    except:
        print("❌ 서버에 연결할 수 없습니다.")
        return
    
    # 고도화된 WBS 생성 테스트
    success = test_enhanced_wbs_generation(base_url)
    
    if success:
        print("\n🎉 고도화된 WBS 생성 테스트 성공!")
        print("📋 주요 기능:")
        print("  ✅ 요구사항 추출 및 분석")
        print("  ✅ 기술적 복잡도 평가")
        print("  ✅ 팀원 기술 역량 기반 작업 할당")
        print("  ✅ 개발 기간 추정")
        print("  ✅ 프로젝트 단계별 분해")
        print("  ✅ 팀원 작업량 분배")
        print("  ✅ 타임라인 생성")
    else:
        print("\n⚠️ 고도화된 WBS 생성 테스트 실패")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 테스트가 사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"\n💥 테스트 실행 중 오류 발생: {e}")
