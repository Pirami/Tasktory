# Tasktory

n8n MCP 서버 기반 프로젝트 관리 자동화 시스템

## 개요

Tasktory는 n8n MCP 서버를 통해 LLM과 연동하여 프로젝트 관리 업무를 자동화하는 Python 기반 시스템입니다. VDI 환경에서 활용 가능하며, Jira, Confluence, Notion과 연동하여 프로젝트 생명주기 전반을 지원합니다.

> **핵심 특징**: n8n의 Model Context Protocol (MCP) 서버를 통한 LLM 연동으로 더욱 강력한 AI 기반 프로젝트 관리 자동화를 제공합니다.

## 주요 기능

### 1. 요건 추출 및 WBS 생성

- **입력**: 제안서, RFP, 프로젝트 목표, 팀 인력 정보
- **출력**: WBS 및 역할 분배 (기술 수준별 개발자 할당)
- **특징**: AI 기반 요구사항 분석 및 최적화된 작업 할당

### 2. 회의록 자동 작성 및 검토

- **기능**: 회의 녹음 → 음성 인식 → 회의록 생성 → RFP 대비 검토
- **알림**: 프로젝트 범위 이탈 시 PM 자동 알림
- **연동**: Confluence/Notion 자동 문서화

### 3. AI 기반 설계문서 자동화

#### 개발 전 산출물

- 프로그램 정의서
- 시스템 설계서
- 아키텍처 문서

#### 개발 후 산출물

- 단위 테스트 케이스 및 결과
- 운영자 매뉴얼
- 사용자 매뉴얼
- 배포 가이드

## 기술 스택

- **Backend**: FastAPI, Python 3.9+
- **Frontend**: React 18, Material-UI
- **AI**: OpenAI GPT-4
- **Database**: SQLite (개발용) / PostgreSQL (운영용)
- **Task Queue**: Celery + Redis
- **Integration**: n8n MCP Server (Model Context Protocol)
- **External APIs**: Jira, Confluence, Notion

## 설치 및 실행

### 1. 백엔드 서버 실행

```bash
# 프로젝트 디렉토리로 이동
cd Tasktory

# 의존성 문제 해결
./fix_dependencies.sh

# 가상환경 활성화
source venv/bin/activate

# 환경 변수 설정 (최소한의 설정)
echo "OPENAI_API_KEY=your_api_key_here" > .env
echo "DATABASE_URL=sqlite:///./tasktory.db" >> .env

# 데이터베이스 초기화
PYTHONPATH=. python -c "
from app.core.database import Base, engine
Base.metadata.create_all(bind=engine)
print('✅ 데이터베이스 초기화 완료')
"

# 서버 시작
PYTHONPATH=. python app/main.py
```

### 2. 프론트엔드 실행

```bash
# 새 터미널에서
cd Tasktory

# 프론트엔드 실행
./start_frontend.sh
```

### 3. 접속 확인

- **백엔드 API**: http://localhost:8000/docs
- **프론트엔드**: http://localhost:3000
- **헬스 체크**: http://localhost:8000/health

## 프론트엔드 기능

### 🏠 대시보드

- 프로젝트 통계 및 현황
- 최근 활동 내역
- 빠른 작업 버튼
- 프로젝트 생성 추이 차트

### 📁 프로젝트 관리

- 프로젝트 CRUD 기능
- 프로젝트 상태 관리 (계획/진행중/완료/취소)
- 팀 크기 및 진행률 표시
- 프로젝트별 상세 정보

### 🌳 WBS 자동 생성

- 프로젝트 정보 입력 폼
- 팀 멤버 기술 스택 관리
- AI 기반 WBS 생성
- 역할 분배 및 우선순위 설정
- 생성 결과 시각화

### 🎤 회의 관리

- 회의 생성 및 관리
- 오디오 파일 업로드 (드래그 앤 드롭)
- 회의록 자동 생성
- RFP 대비 검토 및 알림

### 📄 문서 관리

- 설계문서 자동 생성
- 산출물 템플릿 적용
- 문서 유형별 분류
- 파일 업로드 및 다운로드

### ⚙️ 시스템 설정

- API 키 관리
- 외부 서비스 연동 설정
- 알림 설정
- 시스템 옵션

## API 엔드포인트

### 프로젝트 관리

- `POST /api/v1/projects/` - 프로젝트 생성
- `GET /api/v1/projects/` - 프로젝트 목록
- `POST /api/v1/projects/generate-wbs` - WBS 생성
- `POST /api/v1/projects/generate-mcp-wbs` - n8n MCP 서버 기반 LLM 연동 WBS 생성
- `POST /api/v1/projects/generate-documents` - 설계문서 생성
- `POST /api/v1/projects/generate-deliverables` - 산출물 생성

### 회의 관리

- `POST /api/v1/meetings/` - 회의 생성
- `POST /api/v1/meetings/upload-audio/{meeting_id}` - 녹음 파일 업로드
- `POST /api/v1/meetings/process/{meeting_id}` - 회의 처리

### 문서 관리

- `POST /api/v1/documents/` - 문서 생성
- `GET /api/v1/documents/` - 문서 목록
- `POST /api/v1/documents/generate` - 문서 자동 생성

### WBS 관리

- `POST /api/v1/wbs/items` - WBS 아이템 생성
- `GET /api/v1/wbs/items` - WBS 아이템 목록
- `POST /api/v1/wbs/generate` - WBS 자동 생성

## n8n 워크플로우

### 1. WBS 생성 워크플로우

- Jira 이슈 자동 생성
- Confluence 페이지 생성
- Notion 데이터베이스 업데이트

### 2. n8n MCP 서버 WBS 워크플로우 ⭐ NEW

- n8n MCP 서버를 통한 LLM 연동 WBS 생성
- 팀원 기술 스택 기반 최적화된 작업 할당
- 우선순위별 Jira 이슈 자동 생성
- 상세한 역할 분배 표 포함 Confluence 문서화

### 3. 회의록 처리 워크플로우

- 음성 인식 및 텍스트 변환
- 회의록 요약 생성
- RFP 대비 검토 및 알림

### 4. 문서 생성 워크플로우

- 설계문서 자동 생성
- 산출물 템플릿 적용
- 외부 시스템 연동

## 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   FastAPI App   │    │   n8n MCP       │
│                 │◄──►│                 │◄──►│   Client        │
│  - Material-UI  │    │  - API Endpoints│    │                 │
│  - Dashboard    │    │  - Services     │    │  - Workflows    │
│  - WBS Generator│    │  - Models       │    │  - Integrations│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   SQLite/       │
                       │   PostgreSQL    │
                       │   Database      │
                       └─────────────────┘
```

## 개발 가이드

### 프로젝트 구조

```
Tasktory/
├── app/                    # 백엔드 애플리케이션
│   ├── api/v1/endpoints/  # API 엔드포인트
│   ├── core/              # 핵심 모듈
│   ├── models/            # 데이터 모델
│   ├── services/          # 비즈니스 로직
│   └── main.py           # 애플리케이션 진입점
├── frontend/              # 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── components/   # React 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── services/     # API 서비스
│   │   └── App.js        # 메인 앱
│   └── package.json      # 의존성
├── n8n_workflows/         # n8n 워크플로우 템플릿
├── scripts/              # 유틸리티 스크립트
├── requirements.txt      # Python 의존성
└── README.md            # 프로젝트 문서
```

### 빠른 시작

1. **백엔드 실행**:

   ```bash
   ./fix_dependencies.sh
   source venv/bin/activate
   PYTHONPATH=. python app/main.py
   ```

2. **프론트엔드 실행**:

   ```bash
   ./start_frontend.sh
   ```

3. **접속**: http://localhost:3000

### 새로운 서비스 추가

1. `app/services/` 디렉토리에 서비스 클래스 생성
2. `app/api/v1/endpoints/`에 API 엔드포인트 추가
3. `frontend/src/pages/`에 React 페이지 추가
4. `frontend/src/services/api.js`에 API 함수 추가
5. 필요시 n8n 워크플로우 생성

## 테스트

```bash
# 백엔드 테스트
source venv/bin/activate
PYTHONPATH=. python test_system.py

# 프론트엔드 테스트
cd frontend
npm test
```

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 지원

문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.
