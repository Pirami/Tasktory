# Tasktory 실행 및 테스트 가이드

## 🚀 시스템 실행 방법

### 1. 사전 준비

#### 1.1 필수 소프트웨어 설치
```bash
# Python 3.9+ 설치 확인
python3 --version

# PostgreSQL 설치 및 실행 (macOS)
brew install postgresql
brew services start postgresql

# Redis 설치 및 실행 (macOS)
brew install redis
brew services start redis

# n8n 설치 (npm)
npm install -g n8n
```

#### 1.2 환경 변수 설정
```bash
# .env 파일 생성 및 편집
cp .env.example .env
nano .env
```

**필수 환경 변수 예시:**
```env
# OpenAI API (필수)
OPENAI_API_KEY=sk-your-openai-api-key-here

# n8n MCP Server 설정
N8N_MCP_SERVER_URL=http://localhost:5678
N8N_MCP_API_KEY=your_n8n_api_key
N8N_MCP_WORKFLOW_ID=n8n-mcp-llm-workflow

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/tasktory

# Redis (작업 큐용)
REDIS_URL=redis://localhost:6379/0

# 외부 서비스 연동 (선택사항)
JIRA_URL=https://your-domain.atlassian.net
JIRA_USERNAME=your_email@domain.com
JIRA_API_TOKEN=your_jira_api_token

CONFLUENCE_URL=https://your-domain.atlassian.net
CONFLUENCE_USERNAME=your_email@domain.com
CONFLUENCE_API_TOKEN=your_confluence_api_token

NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

### 2. 시스템 설정 및 실행

#### 2.1 자동 설정 스크립트 실행
```bash
# 프로젝트 디렉토리로 이동
cd /Users/greenstar/dev/Tasktory

# 실행 권한 부여
chmod +x scripts/setup.sh

# 자동 설정 실행
./scripts/setup.sh
```

#### 2.2 수동 설정 (선택사항)
```bash
# Python 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 초기화
python -c "
from app.core.database import init_db
import asyncio
asyncio.run(init_db())
print('✅ 데이터베이스 초기화 완료')
"

# 필요한 디렉토리 생성
mkdir -p uploads/meetings uploads/documents logs
```

#### 2.3 n8n 서버 시작
```bash
# 별도 터미널에서 n8n 시작
n8n start

# 또는 특정 포트로 시작
n8n start --tunnel --port 5678
```

#### 2.4 FastAPI 서버 시작
```bash
# 가상환경 활성화 (아직 안했다면)
source venv/bin/activate

# 서버 시작
python app/main.py

# 또는 uvicorn 직접 사용
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. n8n 워크플로우 설정

#### 3.1 워크플로우 가져오기
1. n8n 웹 인터페이스에 접속: `http://localhost:5678`
2. 각 워크플로우 파일을 n8n에 import:
   - `wbs-creation-workflow.json`
   - `n8n-mcp-wbs-workflow.json`
   - `n8n-mcp-llm-workflow.json`

#### 3.2 워크플로우 활성화
1. 각 워크플로우의 **Active** 토글을 켜기
2. 필요한 경우 웹훅 URL 확인 및 업데이트

## 🧪 테스트 방법

### 1. API 테스트

#### 1.1 Swagger UI를 이용한 테스트
```bash
# 브라우저에서 접속
open http://localhost:8000/docs
```

**주요 테스트 엔드포인트:**
- `GET /health` - 서버 상태 확인
- `POST /api/v1/projects/` - 프로젝트 생성
- `POST /api/v1/projects/generate-mcp-wbs` - MCP WBS 생성

#### 1.2 curl을 이용한 테스트

**서버 상태 확인:**
```bash
curl http://localhost:8000/health
```

**프로젝트 생성:**
```bash
curl -X POST "http://localhost:8000/api/v1/projects/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 프로젝트",
    "description": "n8n MCP 서버 테스트용 프로젝트"
  }'
```

**MCP WBS 생성:**
```bash
curl -X POST "http://localhost:8000/api/v1/projects/generate-mcp-wbs" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "proposal_content": "[프로젝트 제안서 내용]",
    "rfp_content": "[RFP 내용]", 
    "project_goals": "[프로젝트 목표]",
    "team_members": [
      {
        "name": "김개발",
        "experience_years": 5,
        "skills": ["Python", "FastAPI", "Docker"],
        "skill_level": "Senior"
      }
    ]
  }'
```

### 2. Python 예제 실행

#### 2.1 MCP 서버 예제 실행
```bash
# 가상환경 활성화
source venv/bin/activate

# 예제 실행
python examples/n8n_mcp_example.py
```

#### 2.2 개별 서비스 테스트
```python
# 테스트용 Python 스크립트 작성
import asyncio
from app.services.n8n_mcp_service import N8nMCPService

async def test_mcp():
    service = N8nMCPService()
    result = await service.process_mcp_wbs(
        project_id=1,
        proposal_content="간단한 프로젝트 제안",
        rfp_content="간단한 RFP",
        project_goals="프로젝트 목표 달성",
        team_members=[{
            "name": "테스터",
            "experience_years": 3,
            "skills": ["Python"],
            "skill_level": "Mid"
        }]
    )
    print(result)

# 실행
asyncio.run(test_mcp())
```

### 3. 통합 테스트

#### 3.1 전체 워크플로우 테스트
```bash
# 1. 네트워크 연결 확인
curl http://localhost:8000/health
curl http://localhost:5678/health

# 2. 데이터베이스 연결 확인
python -c "
from app.core.database import SessionLocal
db = SessionLocal()
db.close()
print('✅ 데이터베이스 연결 성공')
"

# 3. Redis 연결 확인
python -c "
import redis
r = redis.Redis()
r.ping()
print('✅ Redis 연결 성공')
"
```

#### 3.2 n8n 워크플로우 수동 테스트
1. n8n UI에서 각 워크플로우를 선택
2. **Execute Workflow** 버튼 클릭
3. 필요시 테스트 데이터 입력
4. 실행 결과 확인

### 4. 문제 해결

#### 4.1 일반적인 문제들

**포트 충돌:**
```bash
# 포트 사용 확인
lsof -i :8000
lsof -i :5678

# 프로세스 종료
kill -9 <PID>
```

**데이터베이스 연결 오류:**
```bash
# PostgreSQL 상태 확인
brew services list | grep postgresql

# 데이터베이스 재시작
brew services restart postgresql
```

**Redis 연결 오류:**
```bash
# Redis 상태 확인
redis-cli ping
# 응답: pong

# Redis 재시작
brew services restart redis
```

#### 4.2 로그 확인
```bash
# FastAPI 로그 확인
tail -f logs/app.log

# n8n 로그 확인
n8n start --logLevel=debug
```

#### 4.3 환경 변수 확인
```bash
# 환경 변수 로드 확인
python -c "from config import settings; print(f'N8N URL: {settings.n8n_mcp_server_url}')"
```

## 🎯 성능 테스트

### 1. 부하 테스트 (간단)
```bash
# 간단한 부하 테스트 (ab 명령어 사용)
ab -n 100 -c 10 http://localhost:8000/health
```

### 2. 메모리 사용량 확인
```bash
# 프로세스 모니터링
top -pid $(pgrep -f "python app/main.py")
```

## 📊 모니터링

### 1. API 모니터링 엔드포인트
- `GET /health` - 기본 상태 확인
- `GET /metrics` - 성능 지표 (구현시)

### 2. 로그 모니터링
- 애플리케이션 로그: `logs/app.log`
- 에러 로그: `logs/error.log`
- n8n 실행 로그: 콘솔 출력

---

## ✅ 체크리스트

실행 전 확인사항:
- [ ] Python 3.9+ 설치됨
- [ ] PostgreSQL 실행 중
- [ ] Redis 실행 중  
- [ ] n8n 설치 및 실행 중
- [ ] .env 파일 설정 완료
- [ ] 가상환경 활성화
- [ ] 의존성 설치 완료
- [ ] n8n 워크플로우 가져오기 완료
- [ ] FastAPI 서버 실행 중

테스트 완료 확인:
- [ ] `/health` 엔드포인트 응답 확인
- [ ] 프로젝트 생성 API 테스트 성공
- [ ] MCP WBS 생성 API 테스트 성공
- [ ] n8n 워크플로우 실행 확인
- [ ] 외부 서비스 연동 확인 (Jira/Notion 등)
