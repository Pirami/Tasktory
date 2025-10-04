"""
n8n MCP 서버 기반 WBS 생성 예제
VDI 환경에서 n8n MCP 서버를 통한 LLM 연동 예제
"""
import asyncio
import json
from app.services.n8n_mcp_service import N8nMCPService

async def example_mcp_wbs():
    """n8n MCP 서버 기반 WBS 생성 예제"""
    
    # 샘플 데이터
    proposal_content = """
    AI 기반 클라우드 MLOps 플랫폼 구축 제안서
    
    본 프로젝트는 기업의 머신러닝 모델을 자동화하여 관리하고 운영할 수 있는 
    클라우드 기반 MLOps 플랫폼을 구축하는 것을 목표로 합니다.
    
    주요 기능:
    - 모델 학습 파이프라인 자동화
    - 모델 배포 및 추론 서비스 제공
    - 모델 성능 모니터링 및 관리
    - 데이터 품질 관리 시스템
    """
    
    rfp_content = """
    MLOps 플랫폼 RFP (Request for Proposal)
    
    요구사항:
    1. Kubernetes 기반 컨테이너 오케스트레이션
    2. REST API를 통한 모델 관리
    3. 실시간 모니터링 대시보드
    4. 데이터 파이프라인 자동화
    5. 보안 및 접근성 제어
    
    기술적 제약사항:
    - 클라우드 네이티브 아키텍처 필수
    - 마이크로서비스 기반 설계
    - CI/CD 파이프라인 구축
    - 24/7 가용성 보장
    """
    
    project_goals = """
    프로젝트 목표:
    1. 머신러닝 모델의 전체 생명주기 자동화
    2. 개발팀의 생산성 향상
    3. 모델 성능 및 품질 향상
    4. 운영 비용 절감
    5. 스케일러블한 아키텍처 구축
    
    성공 지표:
    - 모델 배포 시간 50% 단축
    - 운영 인력 30% 절감
    - 모델 성능 지표 99.9% 이상 유지
    """
    
    team_members = [
        {
            "name": "김현민",
            "experience_years": 5,
            "skills": ["Kubernetes", "Python", "MLflow", "Docker"],
            "skill_level": "Senior"
        },
        {
            "name": "이지훈",
            "experience_years": 3,
            "skills": ["React", "Node.js", "REST API", "TypeScript"],
            "skill_level": "Mid"
        },
        {
            "name": "박소연",
            "experience_years": 2,
            "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
            "skill_level": "Junior"
        },
        {
            "name": "최민호",
            "experience_years": 4,
            "skills": ["AWS", "Terraform", "Jenkins", "Linux"],
            "skill_level": "Senior"
        }
    ]
    
    # n8n MCP 서비스 초기화
    mcp_service = N8nMCPService()
    
    try:
        # WBS 생성 실행 (MCP 서버를 통한 LLM 연동)
        result = await mcp_service.process_mcp_wbs(
            project_id=1,
            proposal_content=proposal_content,
            rfp_content=rfp_content,
            project_goals=project_goals,
            team_members=team_members
        )
        
        print("🎉 n8n MCP 서버 기반 WBS 생성 결과:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
        if result.get("status") == "success":
            print("\n✅ 성공적으로 처리된 항목들:")
            print(f"- Jira 티켓 생성: {result.get('jira_tickets_created', 0)}개")
            print(f"- Confluence 페이지: {result.get('confluence_page_created', '생성됨')}")
            print(f"- Notion 페이지: {result.get('notion_updated', '업데이트됨')}")
            print(f"- MCP 실행 ID: {result.get('mcp_execution_id', 'N/A')}")
            
            # WBS 데이터 살펴보기
            wbs_data = result.get("wbs_data", {})
            print(f"\n📊 프로젝트 개요: {wbs_data.get('project_overview', 'N/A')}")
            print(f"📈 총 작업 수: {wbs_data.get('summary', {}).get('total_tasks', 0)}")
            
            print("\n🔗 생성된 배송품목들:")
            for deliverable in wbs_data.get("deliverables", []):
                print(f"  - {deliverable.get('name', 'N/A')}")
                
        else:
            print(f"❌ 처리 실패: {result.get('error', '알 수 없는 오류')}")
            
    except Exception as e:
        print(f"💥 예외 발생: {str(e)}")

if __name__ == "__main__":
    print("🚀 n8n MCP 서버 기반 WBS 생성 예제를 실행합니다...")
    asyncio.run(example_mcp_wbs())
