"""
고도화된 WBS 생성 서비스
요건 추출, Task 분배, 기간 추정을 포함한 종합적인 프로젝트 분석 서비스
"""
import json
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from openai import AsyncOpenAI
from app.core.n8n_client import N8nMCPClient
from config import settings

@dataclass
class TeamMember:
    """팀원 정보 데이터 클래스"""
    name: str
    experience_years: int
    skills: List[str]
    skill_level: str  # Junior, Mid, Senior, Expert
    availability: bool = True
    hourly_rate: Optional[int] = None
    department: Optional[str] = None

@dataclass
class Task:
    """작업 정보 데이터 클래스"""
    name: str
    description: str
    required_skills: List[str]
    skill_level_required: str
    estimated_hours: int
    priority: str  # High, Medium, Low
    dependencies: List[str] = None
    deliverables: List[str] = None

@dataclass
class ProjectPhase:
    """프로젝트 단계 정보"""
    name: str
    description: str
    duration_weeks: int
    tasks: List[Task]
    responsible_team: List[str]

class EnhancedWBSService:
    """고도화된 WBS 생성 서비스"""
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.n8n_client = N8nMCPClient()
    
    async def analyze_requirements(
        self,
        proposal_content: str,
        rfp_content: str,
        project_goals: str,
        additional_files: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """요건 추출 및 분석"""
        
        # 통합된 요구사항 분석 프롬프트
        analysis_prompt = self._create_requirement_analysis_prompt(
            proposal_content, rfp_content, project_goals, additional_files
        )
        
        try:
            # OpenAI를 통한 요구사항 분석
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """당신은 엔터프라이즈 소프트웨어 개발을 위한 시니어 프로젝트 아키텍트입니다. 
                        제안서, RFP, 프로젝트 목표를 분석하여 상세한 요구사항을 추출하고, 
                        기술적 복잡도와 개발 우선순위를 평가합니다."""
                    },
                    {
                        "role": "user",
                        "content": analysis_prompt
                    }
                ],
                temperature=0.2,
                max_tokens=4000
            )
            
            analysis_result = response.choices[0].message.content
            
            # JSON 형식으로 파싱
            return self._parse_requirement_analysis(analysis_result)
            
        except Exception as e:
            raise Exception(f"요구사항 분석 실패: {str(e)}")
    
    async def generate_enhanced_wbs(
        self,
        project_id: int,
        proposal_content: str,
        rfp_content: str,
        project_goals: str,
        team_members: List[Dict[str, Any]],
        additional_files: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """고도화된 WBS 생성"""
        
        try:
            # 1. 요구사항 분석
            requirements = await self.analyze_requirements(
                proposal_content, rfp_content, project_goals, additional_files
            )
            
            # 2. 팀원 정보 구조화
            structured_team = self._structure_team_members(team_members)
            
            # 3. Task 분배 및 기간 추정
            wbs_data = await self._generate_task_allocation(
                requirements, structured_team
            )
            
            # 4. n8n 워크플로우 실행 (외부 시스템 연동)
            n8n_result = await self._execute_n8n_workflow(
                project_id, wbs_data, structured_team
            )
            
            return {
                "status": "success",
                "project_id": project_id,
                "requirements_analysis": requirements,
                "wbs_data": wbs_data,
                "team_allocation": self._generate_team_allocation_summary(wbs_data, structured_team),
                "timeline": self._generate_project_timeline(wbs_data),
                "n8n_execution": n8n_result,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "project_id": project_id
            }
    
    def _create_requirement_analysis_prompt(
        self,
        proposal_content: str,
        rfp_content: str,
        project_goals: str,
        additional_files: List[Dict[str, str]] = None
    ) -> str:
        """요구사항 분석 프롬프트 생성"""
        
        additional_content = ""
        if additional_files:
            additional_content = "\n\n추가 파일 내용:\n"
            for file in additional_files:
                additional_content += f"\n파일명: {file.get('filename', 'Unknown')}\n"
                additional_content += f"내용: {file.get('content', '')}\n"
        
        return f"""
다음 프로젝트 정보를 분석하여 상세한 요구사항을 추출해주세요:

## 제안서 내용:
{proposal_content}

## RFP 내용:
{rfp_content}

## 프로젝트 목표:
{project_goals}
{additional_content}

다음 JSON 형식으로 응답해주세요:
{{
  "project_overview": "프로젝트 전체 개요",
  "business_requirements": [
    {{
      "requirement": "비즈니스 요구사항",
      "priority": "High/Medium/Low",
      "complexity": "Simple/Medium/Complex"
    }}
  ],
  "technical_requirements": [
    {{
      "requirement": "기술적 요구사항",
      "category": "Frontend/Backend/Database/Infrastructure/etc",
      "complexity": "Simple/Medium/Complex",
      "estimated_effort": "S/M/L/XL"
    }}
  ],
  "functional_requirements": [
    {{
      "feature": "기능명",
      "description": "상세 설명",
      "priority": "High/Medium/Low",
      "dependencies": ["의존성 기능들"]
    }}
  ],
  "non_functional_requirements": [
    {{
      "requirement": "성능/보안/확장성 등",
      "description": "상세 설명",
      "priority": "High/Medium/Low"
    }}
  ],
  "technical_stack_suggestions": [
    {{
      "category": "Frontend/Backend/Database/etc",
      "technologies": ["기술 스택"],
      "reasoning": "선택 이유"
    }}
  ],
  "project_complexity": "Simple/Medium/Complex",
  "estimated_duration_weeks": 숫자,
  "risk_factors": ["위험 요소들"]
}}
"""
    
    def _parse_requirement_analysis(self, analysis_text: str) -> Dict[str, Any]:
        """요구사항 분석 결과 파싱"""
        try:
            # JSON 부분 추출
            json_start = analysis_text.find('{')
            json_end = analysis_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = analysis_text[json_start:json_end]
                return json.loads(json_str)
            else:
                # JSON이 없으면 기본 구조 반환
                return {
                    "project_overview": analysis_text,
                    "business_requirements": [],
                    "technical_requirements": [],
                    "functional_requirements": [],
                    "non_functional_requirements": [],
                    "technical_stack_suggestions": [],
                    "project_complexity": "Medium",
                    "estimated_duration_weeks": 12,
                    "risk_factors": []
                }
        except Exception as e:
            raise Exception(f"요구사항 분석 결과 파싱 실패: {str(e)}")
    
    def _structure_team_members(self, team_members: List[Dict[str, Any]]) -> List[TeamMember]:
        """팀원 정보를 구조화된 형태로 변환"""
        structured_team = []
        
        for member in team_members:
            structured_team.append(TeamMember(
                name=member.get('name', ''),
                experience_years=member.get('experience_years', 0),
                skills=member.get('skills', []),
                skill_level=member.get('skill_level', 'Junior'),
                availability=member.get('availability', True),
                hourly_rate=member.get('hourly_rate'),
                department=member.get('department')
            ))
        
        return structured_team
    
    async def _generate_task_allocation(
        self,
        requirements: Dict[str, Any],
        team_members: List[TeamMember]
    ) -> Dict[str, Any]:
        """Task 분배 및 기간 추정"""
        
        # Task 분배 프롬프트 생성
        task_allocation_prompt = self._create_task_allocation_prompt(
            requirements, team_members
        )
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": """당신은 시니어 프로젝트 매니저이자 기술 아키텍트입니다. 
                        요구사항을 분석하여 구체적인 작업으로 분해하고, 
                        팀원의 기술 역량을 고려하여 최적의 작업 할당을 수행합니다.
                        각 작업의 예상 소요 시간과 의존성을 명확히 정의합니다."""
                    },
                    {
                        "role": "user",
                        "content": task_allocation_prompt
                    }
                ],
                temperature=0.3,
                max_tokens=6000
            )
            
            allocation_result = response.choices[0].message.content
            return self._parse_task_allocation(allocation_result, team_members)
            
        except Exception as e:
            raise Exception(f"Task 분배 생성 실패: {str(e)}")
    
    def _create_task_allocation_prompt(
        self,
        requirements: Dict[str, Any],
        team_members: List[TeamMember]
    ) -> str:
        """Task 분배 프롬프트 생성"""
        
        # 팀원 정보 포맷팅
        team_info = "팀원 정보:\n"
        for member in team_members:
            team_info += f"- {member.name} ({member.skill_level}, {member.experience_years}년차): {', '.join(member.skills)}\n"
        
        return f"""
다음 요구사항을 분석하여 구체적인 작업으로 분해하고 팀원에게 할당해주세요:

## 프로젝트 개요:
{requirements.get('project_overview', '')}

## 비즈니스 요구사항:
{json.dumps(requirements.get('business_requirements', []), ensure_ascii=False, indent=2)}

## 기술적 요구사항:
{json.dumps(requirements.get('technical_requirements', []), ensure_ascii=False, indent=2)}

## 기능적 요구사항:
{json.dumps(requirements.get('functional_requirements', []), ensure_ascii=False, indent=2)}

## 비기능적 요구사항:
{json.dumps(requirements.get('non_functional_requirements', []), ensure_ascii=False, indent=2)}

{team_info}

다음 JSON 형식으로 응답해주세요:
{{
  "project_phases": [
    {{
      "phase_name": "단계명",
      "description": "단계 설명",
      "duration_weeks": 숫자,
      "tasks": [
        {{
          "task_name": "작업명",
          "description": "상세 설명",
          "required_skills": ["필요 기술"],
          "skill_level_required": "Junior/Mid/Senior/Expert",
          "estimated_hours": 숫자,
          "priority": "High/Medium/Low",
          "assigned_to": "담당자명",
          "assignment_reason": "할당 이유",
          "dependencies": ["의존 작업들"],
          "deliverables": ["산출물들"],
          "start_week": 숫자,
          "end_week": 숫자
        }}
      ]
    }}
  ],
  "team_workload": [
    {{
      "member_name": "팀원명",
      "total_hours": 숫자,
      "tasks_count": 숫자,
      "utilization_rate": "백분율"
    }}
  ],
  "project_timeline": {{
    "total_duration_weeks": 숫자,
    "critical_path": ["중요 경로 작업들"],
    "milestones": [
      {{
        "milestone": "마일스톤명",
        "week": 숫자,
        "deliverables": ["산출물들"]
      }}
    ]
  }}
}}
"""
    
    def _parse_task_allocation(
        self,
        allocation_text: str,
        team_members: List[TeamMember]
    ) -> Dict[str, Any]:
        """Task 분배 결과 파싱"""
        try:
            # JSON 부분 추출
            json_start = allocation_text.find('{')
            json_end = allocation_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = allocation_text[json_start:json_end]
                return json.loads(json_str)
            else:
                # 기본 구조 반환
                return self._create_default_wbs_structure(team_members)
                
        except Exception as e:
            # 파싱 실패시 기본 구조 반환
            return self._create_default_wbs_structure(team_members)
    
    def _create_default_wbs_structure(self, team_members: List[TeamMember]) -> Dict[str, Any]:
        """기본 WBS 구조 생성"""
        return {
            "project_phases": [
                {
                    "phase_name": "기획 및 설계",
                    "description": "요구사항 분석 및 시스템 설계",
                    "duration_weeks": 2,
                    "tasks": [
                        {
                            "task_name": "요구사항 분석",
                            "description": "상세 요구사항 정의",
                            "required_skills": ["분석", "문서화"],
                            "skill_level_required": "Senior",
                            "estimated_hours": 40,
                            "priority": "High",
                            "assigned_to": team_members[0].name if team_members else "미할당",
                            "assignment_reason": "시니어 레벨 필요",
                            "dependencies": [],
                            "deliverables": ["요구사항 명세서"],
                            "start_week": 1,
                            "end_week": 2
                        }
                    ]
                }
            ],
            "team_workload": [
                {
                    "member_name": member.name,
                    "total_hours": 0,
                    "tasks_count": 0,
                    "utilization_rate": "0%"
                } for member in team_members
            ],
            "project_timeline": {
                "total_duration_weeks": 12,
                "critical_path": [],
                "milestones": []
            }
        }
    
    async def _execute_n8n_workflow(
        self,
        project_id: int,
        wbs_data: Dict[str, Any],
        team_members: List[TeamMember]
    ) -> Dict[str, Any]:
        """n8n 워크플로우 실행"""
        try:
            # n8n MCP 워크플로우 실행
            n8n_payload = {
                "project_id": project_id,
                "wbs_data": wbs_data,
                "team_assignment": self._extract_team_assignment(wbs_data),
                "execution_type": "enhanced_wbs"
            }
            
            result = await self.n8n_client.execute_workflow(
                "n8n-mcp-wbs-workflow",
                n8n_payload
            )
            
            return result
            
        except Exception as e:
            return {
                "status": "failed",
                "error": f"n8n 워크플로우 실행 실패: {str(e)}"
            }
    
    def _extract_team_assignment(self, wbs_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """팀 할당 정보 추출"""
        team_assignments = []
        
        for phase in wbs_data.get("project_phases", []):
            for task in phase.get("tasks", []):
                assigned_to = task.get("assigned_to", "")
                if assigned_to and not any(a["name"] == assigned_to for a in team_assignments):
                    team_assignments.append({
                        "name": assigned_to,
                        "role": task.get("skill_level_required", ""),
                        "task_count": 0,
                        "total_hours": 0,
                        "tasks": []
                    })
        
        # 작업 수 및 시간 계산
        for phase in wbs_data.get("project_phases", []):
            for task in phase.get("tasks", []):
                assigned_to = task.get("assigned_to", "")
                for assignment in team_assignments:
                    if assignment["name"] == assigned_to:
                        assignment["task_count"] += 1
                        assignment["total_hours"] += task.get("estimated_hours", 0)
                        assignment["tasks"].append({
                            "name": task.get("task_name", ""),
                            "priority": task.get("priority", "Medium"),
                            "hours": task.get("estimated_hours", 0)
                        })
        
        return team_assignments
    
    def _generate_team_allocation_summary(
        self,
        wbs_data: Dict[str, Any],
        team_members: List[TeamMember]
    ) -> Dict[str, Any]:
        """팀 할당 요약 생성"""
        summary = {
            "total_team_members": len(team_members),
            "assigned_members": 0,
            "unassigned_tasks": 0,
            "workload_distribution": [],
            "skill_utilization": {}
        }
        
        # 할당된 멤버 수 계산
        assigned_members = set()
        for phase in wbs_data.get("project_phases", []):
            for task in phase.get("tasks", []):
                if task.get("assigned_to"):
                    assigned_members.add(task.get("assigned_to"))
                else:
                    summary["unassigned_tasks"] += 1
        
        summary["assigned_members"] = len(assigned_members)
        
        # 작업량 분배 계산
        for member in team_members:
            member_workload = {
                "name": member.name,
                "skill_level": member.skill_level,
                "total_hours": 0,
                "task_count": 0,
                "utilization_rate": "0%"
            }
            
            for phase in wbs_data.get("project_phases", []):
                for task in phase.get("tasks", []):
                    if task.get("assigned_to") == member.name:
                        member_workload["total_hours"] += task.get("estimated_hours", 0)
                        member_workload["task_count"] += 1
            
            if member_workload["total_hours"] > 0:
                # 주당 40시간 기준으로 활용률 계산
                weeks = wbs_data.get("project_timeline", {}).get("total_duration_weeks", 12)
                total_available_hours = weeks * 40
                utilization = (member_workload["total_hours"] / total_available_hours) * 100
                member_workload["utilization_rate"] = f"{utilization:.1f}%"
            
            summary["workload_distribution"].append(member_workload)
        
        return summary
    
    def _generate_project_timeline(self, wbs_data: Dict[str, Any]) -> Dict[str, Any]:
        """프로젝트 타임라인 생성"""
        timeline = wbs_data.get("project_timeline", {})
        
        # 간트 차트 데이터 생성
        gantt_data = []
        for phase in wbs_data.get("project_phases", []):
            for task in phase.get("tasks", []):
                gantt_data.append({
                    "task": task.get("task_name", ""),
                    "start": task.get("start_week", 1),
                    "end": task.get("end_week", 2),
                    "duration": task.get("end_week", 2) - task.get("start_week", 1) + 1,
                    "assigned_to": task.get("assigned_to", ""),
                    "priority": task.get("priority", "Medium")
                })
        
        timeline["gantt_data"] = gantt_data
        return timeline
