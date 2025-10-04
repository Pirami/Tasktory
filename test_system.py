#!/usr/bin/env python3
"""
Tasktory 시스템 테스트 스크립트
전체 시스템의 상태와 기능을 테스트하는 스크립트
"""
import asyncio
import sys
import json
import requests
from typing import Dict, Any

def test_health_check(base_url: str = "http://localhost:8000") -> bool:
    """서버 상태 확인"""
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ 서버 상태: 정상")
            return True
        else:
            print(f"❌ 서버 상태: 오류 (상태 코드: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ 서버 연결 실패: {e}")
        return False

def test_project_creation(base_url: str = "http://localhost:8000") -> int:
    """프로젝트 생성 테스트"""
    try:
        test_project = {
            "name": "테스트 프로젝트",
            "description": "시스템 테스트용 프로젝트"
        }
        
        response = requests.post(
            f"{base_url}/api/v1/projects/",
            headers={"Content-Type": "application/json"},
            json=test_project
        )
        
        if response.status_code == 200:
            project_data = response.json()
            print(f"✅ 프로젝트 생성 성공: {project_data['name']} (ID: {project_data['id']})")
            return project_data['id']
        else:
            print(f"❌ 프로젝트 생성 실패: {response.status_code}")
            return -1
            
    except Exception as e:
        print(f"❌ 프로젝트 생성 테스트 오류: {e}")
        return -1

def test_mcp_wbs_generation(project_id: int, base_url: str = "http://localhost:8000") -> bool:
    """MCP WBS 생성 테스트"""
    try:
        test_data = {
            "project_id": project_id,
            "proposal_content": """
            AI 기반 데이터 분석 플랫폼 개발 제안서
            
            본 프로젝트는 기업의 데이터를 실시간으로 분석하고 
            인사이트를 제공하는 클라우드 기반 플랫폼을 개발합니다.
            """,
            "rfp_content": """
            데이터 분석 플랫폼 RFP
            
            요구사항:
            1. 실시간 데이터 처리
            2. 머신러닝 모델 통합
            3. 웹 기반 대시보드
            4. API 제공
            5. 데이터 시각화
            """,
            "project_goals": """
            프로젝트 목표:
            1. 데이터 처리 성능 향상 50%
            2. 분석 시간 단축 70%
            3. 사용자 만족도 95% 이상
            4. 시스템 안정성 99.9% 달성
            """,
            "team_members": [
                {
                    "name": "김개발",
                    "experience_years": 5,
                    "skills": ["Python", "Machine Learning", "Data Analysis"],
                    "skill_level": "Senior"
                },
                {
                    "name": "이백엔드",
                    "experience_years": 3,
                    "skills": ["Node.js", "Express", "PostgreSQL"],
                    "skill_level": "Mid"
                },
                {
                    "name": "박프론트",
                    "experience_years": 2,
                    "skills": ["React", "JavaScript", "CSS"],
                    "skill_level": "Junior"
                }
            ]
        }
        
        response = requests.post(
            f"{base_url}/api/v1/projects/generate-mcp-wbs",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=120  # 2분 타임아웃
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ MCP WBS 생성 성공")
            print(f"   - 상태: {result.get('status', 'N/A')}")
            
            if result.get('status') == 'success':
                wbs_data = result.get('wbs_data', {})
                print(f"   - 프로젝트 제목: {wbs_data.get('project_overview', 'N/A')}")
                print(f"   - 총 작업 수: {wbs_data.get('summary', {}).get('total_tasks', 0)}")
                print(f"   - 배송품목 수: {len(wbs_data.get('deliverables', []))}")
                
                if result.get('mcp_execution_id'):
                    print(f"   - MCP 실행 ID: {result.get('mcp_execution_id')}")
                
                return True
            else:
                print(f"   - 오류: {result.get('error', '알 수 없는 오류')}")
                return False
        else:
            print(f"❌ MCP WBS 생성 실패: {response.status_code}")
            print(f"   응답: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ MCP WBS 생성 타임아웃 (120초 초과)")
        return False
    except Exception as e:
        print(f"❌ MCP WBS 생성 테스트 오류: {e}")
        return False

def test_n8n_integration() -> bool:
    """n8n 통합 상태 확인"""
    try:
        n8n_response = requests.get("http://localhost:5678", timeout=10)
        if n8n_response.status_code == 200:
            print("✅ n8n 서버 연결 성공")
            return True
        else:
            print(f"⚠️ n8n 서버 응답 이상: {n8n_response.status_code}")
            return False
    except Exception as e:
        print(f"❌ n8n 서버 연결 실패: {e}")
        print("   n8n 서버가 실행 중인지 확인하세요: n8n start")
        return False

def main():
    """메인 실행 함수"""
    print("🚀 Tasktory 시스템 테스트 시작")
    print("=" * 50)
    
    # 기본 URL 설정
    base_url = "http://localhost:8000"
    
    # 테스트 결과 추적
    results = {}
    
    # 1. 기본 서버 상태 확인
    results["server"] = test_health_check(base_url)
    
    # 2. n8n 서버 확인
    results["n8n"] = test_n8n_integration()
    
    # 3. 프로젝트 생성 테스트
    project_id = test_project_creation(base_url)
    results["project_creation"] = project_id > 0
    
    # 4. MCP WBS 생성 테스트
    if project_id > 0:
        results["mcp_wbs"] = test_mcp_wbs_generation(project_id, base_url)
    else:
        print("⚠️ 프로젝트 ID가 없어 MCP WBS 테스트를 건너뜁니다.")
        results["mcp_wbs"] = False
    
    # 5. 테스트 결과 요약
    print("\n" + "=" * 50)
    print("📊 테스트 결과 요약")
    print("=" * 50)
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result is True)
    
    print(f"총 테스트 항목: {total_tests}")
    print(f"성공: {passed_tests}")
    print(f"실패: {total_tests - passed_tests}")
    
    print("\n📋 상세 결과:")
    for test_name, result in results.items():
        status = "✅ 통과" if result else "❌ 실패"
        print(f"  - {test_name}: {status}")
    
    if passed_tests == total_tests:
        print("\n🎉 모든 테스트 통과!")
        sys.exit(0)  # 성공
    else:
        print("\n⚠️ 일부 테스트 실패")
        sys.exit(1)  # 실패

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 테스트가 사용자에 의해 중단되었습니다.")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 테스트 실행 중 오류 발생: {e}")
        sys.exit(1)
