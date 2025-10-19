"""
설정 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import requests
import os

router = APIRouter()

@router.post("/test-connection")
async def test_connection(service_data: Dict[str, Any]):
    """외부 서비스 연결 테스트"""
    try:
        service = service_data.get("service")
        
        if service == "jira":
            return await test_jira_connection()
        elif service == "confluence":
            return await test_confluence_connection()
        elif service == "notion":
            return await test_notion_connection()
        elif service == "n8n":
            return await test_n8n_connection()
        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 서비스입니다.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def test_jira_connection():
    """Jira 연결 테스트"""
    try:
        # TODO: 실제 Jira API 연결 테스트 구현
        return {
            "status": "success",
            "message": "Jira 연결 테스트는 준비 중입니다.",
            "service": "jira"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Jira 연결 실패: {str(e)}",
            "service": "jira"
        }

async def test_confluence_connection():
    """Confluence 연결 테스트"""
    try:
        # TODO: 실제 Confluence API 연결 테스트 구현
        return {
            "status": "success",
            "message": "Confluence 연결 테스트는 준비 중입니다.",
            "service": "confluence"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Confluence 연결 실패: {str(e)}",
            "service": "confluence"
        }

async def test_notion_connection():
    """Notion 연결 테스트"""
    try:
        # TODO: 실제 Notion API 연결 테스트 구현
        return {
            "status": "success",
            "message": "Notion 연결 테스트는 준비 중입니다.",
            "service": "notion"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Notion 연결 실패: {str(e)}",
            "service": "notion"
        }

async def test_n8n_connection():
    """n8n MCP 서버 연결 테스트"""
    try:
        # TODO: 실제 n8n MCP 서버 연결 테스트 구현
        return {
            "status": "success",
            "message": "n8n MCP 서버 연결 테스트는 준비 중입니다.",
            "service": "n8n"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"n8n MCP 서버 연결 실패: {str(e)}",
            "service": "n8n"
        }

@router.get("/")
async def get_settings():
    """설정 정보 조회"""
    try:
        from config import settings
        
        return {
            "jira": {
                "url": settings.jira_url,
                "username": settings.jira_username,
                "api_token": "***" if settings.jira_api_token else None
            },
            "confluence": {
                "url": settings.confluence_url,
                "username": settings.confluence_username,
                "api_token": "***" if settings.confluence_api_token else None
            },
            "notion": {
                "api_key": "***" if settings.notion_api_key else None,
                "database_id": settings.notion_database_id
            },
            "n8n": {
                "server_url": settings.n8n_mcp_server_url,
                "api_key": "***" if settings.n8n_mcp_api_key else None,
                "workflow_id": settings.n8n_mcp_workflow_id
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/")
async def update_settings(settings_data: Dict[str, Any]):
    """설정 정보 업데이트"""
    try:
        from config import settings
        
        # 설정 업데이트 (실제로는 환경변수나 설정 파일에 저장해야 함)
        # 현재는 메모리에서만 업데이트
        for key, value in settings_data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        return {
            "status": "success",
            "message": "설정이 성공적으로 업데이트되었습니다.",
            "updated_fields": list(settings_data.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
