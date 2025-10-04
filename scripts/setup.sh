#!/bin/bash

# Tasktory 프로젝트 설정 스크립트
# n8n MCP client 기반 프로젝트 관리 자동화 시스템

echo "🚀 Tasktory 프로젝트 설정을 시작합니다..."

# Python 가상환경 생성
echo "📦 Python 가상환경을 생성합니다..."
python3 -m venv venv
source venv/bin/activate

# 의존성 설치
echo "📚 의존성을 설치합니다..."
pip install -r requirements.txt

# 환경 변수 파일 생성
echo "⚙️ 환경 변수 파일을 생성합니다..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# n8n MCP Server 설정
N8N_MCP_SERVER_URL=http://localhost:5678
N8N_MCP_API_KEY=your_n8n_api_key_here
N8N_MCP_WORKFLOW_ID=n8n-mcp-llm-workflow

# 데이터베이스 설정
DATABASE_URL=postgresql://user:password@localhost:5432/tasktory

# Redis 설정 (Celery용)
REDIS_URL=redis://localhost:6379/0

# Jira 설정 (선택사항)
JIRA_URL=https://your-domain.atlassian.net
JIRA_USERNAME=your_email@domain.com
JIRA_API_TOKEN=your_jira_api_token

# Confluence 설정 (선택사항)
CONFLUENCE_URL=https://your-domain.atlassian.net
CONFLUENCE_USERNAME=your_email@domain.com
CONFLUENCE_API_TOKEN=your_confluence_api_token

# Notion 설정 (선택사항)
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here

# 이메일 설정 (선택사항)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EOF
    echo "✅ .env 파일이 생성되었습니다. 필요한 값들을 설정해주세요."
else
    echo "⚠️ .env 파일이 이미 존재합니다."
fi

# 업로드 디렉토리 생성
echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p uploads/meetings
mkdir -p uploads/documents
mkdir -p logs

# 데이터베이스 초기화
echo "🗄️ 데이터베이스를 초기화합니다..."
python -c "
from app.core.database import init_db
import asyncio
asyncio.run(init_db())
print('✅ 데이터베이스 초기화 완료')
"

# n8n 워크플로우 설정
echo "🔧 n8n 워크플로우를 설정합니다..."
if command -v n8n &> /dev/null; then
    echo "n8n이 설치되어 있습니다. 워크플로우를 가져옵니다..."
    # n8n 워크플로우 가져오기 로직
else
    echo "⚠️ n8n이 설치되어 있지 않습니다. n8n을 설치하고 워크플로우를 수동으로 가져와주세요."
fi

echo "🎉 Tasktory 프로젝트 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. .env 파일에서 필요한 API 키들을 설정하세요"
echo "2. n8n을 설치하고 워크플로우를 가져오세요"
echo "3. 'python app/main.py' 명령으로 서버를 시작하세요"
echo ""
echo "API 문서: http://localhost:8000/docs"
