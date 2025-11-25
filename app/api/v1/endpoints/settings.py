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

@router.get("/integration-status")
async def get_integration_status():
    """모든 연동 서비스 상태 확인"""
    try:
        status_results = {}
        
        # 각 서비스별 상태 확인
        jira_status = await test_jira_connection()
        confluence_status = await test_confluence_connection()
        notion_status = await test_notion_connection()
        n8n_status = await test_n8n_connection()
        
        from datetime import datetime
        
        current_time = datetime.now().isoformat() + "Z"
        
        status_results = {
            "jira": {
                "status": jira_status.get("status"),
                "message": jira_status.get("message"),
                "last_checked": jira_status.get("last_checked", current_time)
            },
            "confluence": {
                "status": confluence_status.get("status"),
                "message": confluence_status.get("message"),
                "last_checked": confluence_status.get("last_checked", current_time)
            },
            "notion": {
                "status": notion_status.get("status"),
                "message": notion_status.get("message"),
                "last_checked": notion_status.get("last_checked", current_time)
            },
            "n8n": {
                "status": n8n_status.get("status"),
                "message": n8n_status.get("message"),
                "last_checked": n8n_status.get("last_checked", current_time)
            }
        }
        
        return {
            "overall_status": "healthy" if all(
                status.get("status") == "success" 
                for status in status_results.values()
            ) else "partial" if any(
                status.get("status") == "success" 
                for status in status_results.values()
            ) else "unhealthy",
            "services": status_results,
            "total_services": len(status_results),
            "healthy_services": sum(1 for status in status_results.values() if status.get("status") == "success")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def test_jira_connection():
    """Jira 연결 테스트"""
    try:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        # TODO: 실제 Jira API 연결 테스트 구현
        return {
            "status": "success",
            "message": "Jira 연결 테스트는 준비 중입니다.",
            "service": "jira",
            "last_checked": current_time
        }
    except Exception as e:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        return {
            "status": "error",
            "message": f"Jira 연결 실패: {str(e)}",
            "service": "jira",
            "last_checked": current_time
        }

async def test_confluence_connection():
    """Confluence 연결 테스트"""
    try:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        # TODO: 실제 Confluence API 연결 테스트 구현
        return {
            "status": "success",
            "message": "Confluence 연결 테스트는 준비 중입니다.",
            "service": "confluence",
            "last_checked": current_time
        }
    except Exception as e:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        return {
            "status": "error",
            "message": f"Confluence 연결 실패: {str(e)}",
            "service": "confluence",
            "last_checked": current_time
        }

async def test_notion_connection():
    """Notion 연결 테스트"""
    try:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        # TODO: 실제 Notion API 연결 테스트 구현
        return {
            "status": "success",
            "message": "Notion 연결 테스트는 준비 중입니다.",
            "service": "notion",
            "last_checked": current_time
        }
    except Exception as e:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        return {
            "status": "error",
            "message": f"Notion 연결 실패: {str(e)}",
            "service": "notion",
            "last_checked": current_time
        }

async def test_n8n_connection():
    """n8n MCP 서버 연결 테스트"""
    try:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        # TODO: 실제 n8n MCP 서버 연결 테스트 구현
        return {
            "status": "success",
            "message": "n8n MCP 서버 연결 테스트는 준비 중입니다.",
            "service": "n8n",
            "last_checked": current_time
        }
    except Exception as e:
        from datetime import datetime
        current_time = datetime.now().isoformat() + "Z"
        
        return {
            "status": "error",
            "message": f"n8n MCP 서버 연결 실패: {str(e)}",
            "service": "n8n",
            "last_checked": current_time
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
