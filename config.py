"""
Tasktory 프로젝트 설정 파일
n8n MCP client 기반 프로젝트 관리 자동화 시스템
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # OpenAI API 설정
    openai_api_key: str = ""
    
    # n8n MCP Server 설정
    n8n_mcp_server_url: str = "http://localhost:5678"
    n8n_mcp_api_key: str = ""
    n8n_mcp_workflow_id: str = "n8n-mcp-llm-workflow"
    
    # 데이터베이스 설정
    database_url: str = "sqlite:///./tasktory.db"
    
    # Redis 설정 (Celery용)
    redis_url: str = "redis://localhost:6379/0"
    
    # Jira 설정
    jira_url: str = ""
    jira_username: str = ""
    jira_api_token: str = ""
    
    # Confluence 설정
    confluence_url: str = ""
    confluence_username: str = ""
    confluence_api_token: str = ""
    
    # Notion 설정
    notion_api_key: str = ""
    notion_database_id: str = ""
    
    # 이메일 설정 (알림용)
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    
    # 애플리케이션 설정
    app_name: str = "Tasktory"
    app_version: str = "1.0.0"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# 전역 설정 인스턴스
settings = Settings()
