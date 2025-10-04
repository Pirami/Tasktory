# 🚀 Tasktory 빠른 시작 가이드

## 문제 해결 및 실행 방법

### 1. 의존성 문제 해결

터미널에서 다음 명령어를 실행하여 의존성 문제를 해결하세요:

```bash
# 의존성 문제 해결 스크립트 실행
./fix_dependencies.sh
```

### 2. 환경 변수 설정

`.env` 파일이 생성되었는지 확인하고 필요한 API 키를 설정하세요:

```bash
# .env 파일 편집
nano .env
```

**최소 필수 설정:**

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key
DATABASE_URL=postgresql://user:password@localhost:5432/tasktory
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL이 설치되어 있다면
brew install postgresql
brew services start postgresql

# 데이터베이스 생성
createdb tasktory

# 또는 SQLite 사용 (개발용)
# DATABASE_URL을 다음과 같이 변경:
# DATABASE_URL=sqlite:///./tasktory.db
```

### 4. 서버 실행

#### 4.1 가상환경 활성화

```bash
source venv/bin/activate
```

#### 4.2 데이터베이스 초기화

```bash
python -c "
from app.core.database import init_db
import asyncio
asyncio.run(init_db())
print('✅ 데이터베이스 초기화 완료')
"
```

#### 4.3 서버 시작

```bash
python app/main.py
```

#### 4.4 브라우저에서 확인

- API 문서: http://localhost:8000/docs
- 헬스 체크: http://localhost:8000/health

### 5. 테스트 실행

새 터미널에서:

```bash
# 가상환경 활성화
source venv/bin/activate

# 테스트 스크립트 실행
python test_system.py
```

## 🎯 주요 API 엔드포인트 테스트

### 1. 서버 상태 확인

```bash
curl http://localhost:8000/health
```

### 2. 프로젝트 생성

```bash
curl -X POST "http://localhost:8000/api/v1/projects/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 프로젝트",
    "description": "빠른 시작 테스트"
  }'
```

### 3. MCP WBS 생성 (OpenAI API 키 필수)

```bash
curl -X POST "http://localhost:8000/api/v1/projects/generate-mcp-wbs" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "proposal_content": "간단한 프로젝트",
    "rfp_content": "간단한 RFP",
    "project_goals": "프로젝트 목표",
    "team_members": [
      {
        "name": "김개발",
        "experience_years": 3,
        "skills": ["Python", "JavaScript"],
        "skill_level": "Mid"
      }
    ]
  }'
```

## 💡 문제 해결 팁

### numpy 설치 문제

- Python 3.12에서 `distutils` 문제는 `fix_dependencies.sh` 스크립트로 해결

### 데이터베이스 연결 오류

- 임시로 SQLite 사용: `DATABASE_URL=sqlite:///./tasktory.db`

### OpenAI API 키 오류

- 실제 OpenAI API 키가 필요합니다
- 테스트용으로 임시 키 사용시 WBS 생성 기능만 작동하지 않음

### n8n 서버 (선택사항)

```bash
# n8n 설치 및 실행 (자동화 기능용)
npm install -g n8n
n8n start
```

## ✅ 실행 확인 체크리스트

- [ ] `./fix_dependencies.sh` 실행 완료
- [ ] `.env` 파일에 OpenAI API 키 설정
- [ ] 가상환경 활성화: `source venv/bin/activate`
- [ ] 데이터베이스 초기화 완료
- [ ] 서버 실행: `python app/main.py`
- [ ] 브라우저에서 http://localhost:8000/docs 접속 가능
- [ ] 테스트 스크립트 실행: `python test_system.py`

## 🎉 성공 확인

모든 체크리스트가 완료되면 다음 메시지가 표시됩니다:

```
🎉 모든 테스트 통과!
```

이제 Tasktory 시스템을 사용할 수 있습니다! 🚀
