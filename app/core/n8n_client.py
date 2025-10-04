"""
n8n MCP Client 구현
n8n과의 통신을 담당하는 클라이언트 모듈
"""
import asyncio
import json
from typing import Dict, List, Any, Optional
import httpx
from config import settings

class N8nMCPClient:
    """n8n MCP Client 클래스"""
    
    def __init__(self):
        self.base_url = settings.n8n_mcp_server_url
        self.api_key = settings.n8n_mcp_api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def execute_workflow(self, workflow_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """n8n 워크플로우 실행"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/v1/workflows/{workflow_id}/execute",
                    headers=self.headers,
                    json=input_data,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise Exception(f"n8n 워크플로우 실행 실패: {str(e)}")
    
    async def get_workflow_status(self, execution_id: str) -> Dict[str, Any]:
        """워크플로우 실행 상태 조회"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/executions/{execution_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise Exception(f"워크플로우 상태 조회 실패: {str(e)}")
    
    async def trigger_webhook(self, webhook_url: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """웹훅 트리거"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    webhook_url,
                    json=data,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise Exception(f"웹훅 트리거 실패: {str(e)}")
    
    async def create_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 워크플로우 생성"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/v1/workflows",
                    headers=self.headers,
                    json=workflow_data,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise Exception(f"워크플로우 생성 실패: {str(e)}")
    
    async def get_workflows(self) -> List[Dict[str, Any]]:
        """워크플로우 목록 조회"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/workflows",
                    headers=self.headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise Exception(f"워크플로우 목록 조회 실패: {str(e)}")
