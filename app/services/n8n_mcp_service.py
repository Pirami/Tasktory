"""
n8n MCP 서버 통합 서비스
n8n MCP (Model Context Protocol) 서버를 통한 AI 모델 연동 WBS 생성 서비스
"""
import json
from typing import Dict, List, Any, Optional
from openai import AsyncOpenAI
from app.core.n8n_client import N8nMCPClient
from config import settings
# from prompts.cursor_ai_template import format_cursor_prompt, format_team_info_table

# 임시 함수들
def format_team_info_table(team_members: list) -> str:
    """팀 멤버 정보를 표 형태로 포맷팅"""
    if not team_members:
        return "팀 정보가 제공되지 않았습니다."
    
    header = "이름 | 연차 | 기술스택 | 숙련도"
    rows = []
    
    for member in team_members:
        name = member.get('name', 'N/A')
        years = f"{member.get('experience_years', 0)}년"
        skills = ', '.join(member.get('skills', []))
        level = member.get('skill_level', 'N/A')
        rows.append(f"{name} | {years} | {skills} | {level}")
    
    return header + "\n" + "\n".join(rows)

def format_cursor_prompt(proposal_content: str, rfp_content: str, 
                        project_goals: str, team_info_table: str) -> str:
    """간단한 프롬프트 생성"""
    return f"""
다음 프로젝트 정보를 분석하여 WBS를 생성해주세요:

제안서:
{proposal_content}

RFP:
{rfp_content}

프로젝트 목표:
{project_goals}

팀 정보:
{team_info_table}

JSON 형식으로 응답해주세요:
{{
  "project_overview": "프로젝트 요약",
  "deliverables": [
    {{
      "name": "배송품목명",
      "description": "설명",
      "tasks": [
        {{
          "task_name": "작업명",
          "assigned_to": "담당자",
          "priority": "High/Medium/Low"
        }}
      ]
    }}
  ],
  "summary": {{
    "total_tasks": 숫자
  }}
}}
"""

class N8nMCPService:
    """n8n MCP 서버를 통한 AI 모델 연동 WBS 생성 서비스"""
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.n8n_client = N8nMCPClient()
    
    async def generate_wbs_via_n8n_mcp(
        self,
        proposal_content: str,
        rfp_content: str,
        project_goals: str,
        team_members: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """n8n MCP 서버를 통한 LLM 연동 WBS 생성"""
        
        try:
            # 팀 정보를 표 형태로 포맷팅
            team_info_table = format_team_info_table(team_members)
            
            # MCP 서버용 프롬프트 생성
            prompt = format_cursor_prompt(
                proposal_content=proposal_content,
                rfp_content=rfp_content,
                project_goals=project_goals,
                team_info_table=team_info_table
            )
            
            # n8n MCP 서버를 통한 LLM 호출
            mcp_response = await self.n8n_client.execute_workflow(
                "n8n-mcp-llm-workflow",
                {
                    "prompt": prompt,
                    "model_config": {
                        "model": "gpt-4",
                        "temperature": 0.3,
                        "max_tokens": 4000,
                        "system_message": "당신은 엔터프라이즈 R&D 환경을 위한 AI 프로젝트 아키텍트 겸 기술 프로젝트 매니저입니다."
                    },
                    "input_data": {
                        "proposal_content": proposal_content,
                        "rfp_content": rfp_content,
                        "project_goals": project_goals,
                        "team_members": team_members
                    }
                }
            )
            
            # MCP 응답에서 WBS 데이터 추출
            ai_response = mcp_response.get("llm_response", "")
            
            # JSON 부분 추출 및 파싱
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = ai_response[json_start:json_end]
                wbs_data = json.loads(json_str)
                
                return {
                    "status": "success",
                    "wbs_data": wbs_data,
                    "raw_response": ai_response,
                    "mcp_execution_id": mcp_response.get("execution_id"),
                    "team_info_used": team_info_table
                }
            else:
                return {
                    "status": "failed",
                    "error": "MCP 서버 응답에서 JSON을 추출할 수 없습니다",
                    "raw_response": ai_response,
                    "mcp_response": mcp_response
                }
                
        except json.JSONDecodeError as e:
            return {
                "status": "failed",
                "error": f"JSON 파싱 오류: {str(e)}",
                "raw_response": ai_response if 'ai_response' in locals() else "응답 없음"
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "raw_response": None
            }
    
    async def process_mcp_wbs(
        self,
        project_id: int,
        proposal_content: str,
        rfp_content: str,
        project_goals: str,
        team_members: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """n8n MCP 서버를 통한 WBS 생성 후 처리"""
        
        try:
            # 1. n8n MCP 서버를 통한 WBS 생성
            wbs_result = await self.generate_wbs_via_n8n_mcp(
                proposal_content=proposal_content,
                rfp_content=rfp_content,
                project_goals=project_goals,
                team_members=team_members
            )
            
            if wbs_result.get("status") != "success":
                return {
                    "status": "failed",
                    "error": wbs_result.get("error", "WBS 생성 실패"),
                    "raw_response": wbs_result.get("raw_response")
                }
            
            # 2. WBS 데이터를 n8n 형식으로 변환
            n8n_payload = self._convert_wbs_to_n8n_format(wbs_result["wbs_data"])
            
            # 3. n8n 워크플로우 실행 (MCP 서버에서 만들어진 WBS 처리)
            n8n_result = await self.n8n_client.execute_workflow(
                "n8n-mcp-wbs-workflow",
                {
                    "project_id": project_id,
                    "wbs_data": n8n_payload,
                    "team_assignment": self._extract_team_assignment(wbs_result["wbs_data"])
                }
            )
            
            return {
                "status": "success",
                "wbs_data": wbs_result["wbs_data"],
                "n8n_execution_id": n8n_result.get("execution_id"),
                "mcp_execution_id": wbs_result.get("mcp_execution_id"),
                "jira_tickets_created": n8n_result.get("jira_tickets", 0),
                "confluence_page_created": n8n_result.get("confluence_page_url"),
                "notion_updated": n8n_result.get("notion_page_id")
            }
            
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e)
            }
    
    def _convert_wbs_to_n8n_format(self, wbs_data: Dict[str, Any]) -> Dict[str, Any]:
        """WBS 데이터를 n8n 워크플로우용 형식으로 변환"""
        formatted_data = {
            "project_overview": wbs_data.get("project_overview", ""),
            "total_tasks": wbs_data.get("summary", {}).get("total_tasks", 0),
            "deliverables": []
        }
        
        for deliverable in wbs_data.get("deliverables", []):
            formatted_deliverable = {
                "name": deliverable.get("name", ""),
                "description": deliverable.get("description", ""),
                "tasks": []
            }
            
            for task in deliverable.get("tasks", []):
                formatted_task = {
                    "task_name": task.get("task_name", ""),
                    "task_description": task.get("task_description", ""),
                    "assigned_to": task.get("assigned_to", ""),
                    "required_skill": task.get("required_skill", ""),
                    "priority": task.get("priority", "Medium"),
                    "skill_match_reason": task.get("skill_match_reason", "")
                }
                formatted_deliverable["tasks"].append(formatted_task)
            
            formatted_data["deliverables"].append(formatted_deliverable)
        
        return formatted_data
    
    def _extract_team_assignment(self, wbs_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """팀 할당 정보 추출"""
        team_assignments = []
        assigned_people = set()
        
        for deliverable in wbs_data.get("deliverables", []):
            for task in deliverable.get("tasks", []):
                assigned_to = task.get("assigned_to", "")
                if assigned_to and assigned_to not in assigned_people:
                    assigned_people.add(assigned_to)
                    team_assignments.append({
                        "name": assigned_to,
                        "role": task.get("required_skill", ""),
                        "task_count": 0,
                        "tasks": []
                    })
        
        # 작업 수 카운트
        assigned_people = list(assigned_people)
        for assignee in assigned_people:
            task_count = 0
            tasks = []
            
            for deliverable in wbs_data.get("deliverables", []):
                for task in deliverable.get("tasks", []):
                    if task.get("assigned_to", "") == assignee:
                        task_count += 1
                        tasks.append({
                            "name": task.get("task_name", ""),
                            "priority": task.get("priority", "Medium")
                        })
            
            # 해당하는 사람의 정보 업데이트
            for assignment in team_assignments:
                if assignment["name"] == assignee:
                    assignment["task_count"] = task_count
                    assignment["tasks"] = tasks
            
        return team_assignments
