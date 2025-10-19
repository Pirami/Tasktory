#!/bin/bash

echo "🔧 Tasktory 의존성 문제 해결을 시작합니다..."
echo "=================================================="

# 가상환경 확인 및 생성
if [ ! -d "venv" ]; then
    echo "📦 가상환경이 없습니다. 새로 생성합니다..."
    python3 -m venv venv
fi

# 가상환경 활성화
echo "📦 가상환경 활성화..."
source venv/bin/activate

# Python 버전 확인
echo "🐍 Python 버전 확인..."
python --version

echo "📦 pip 업그레이드..."
pip install --upgrade pip

echo "📦 setuptools 및 wheel 설치..."
pip install --upgrade setuptools wheel

echo "📦 빌드 도구 설치..."
pip install --upgrade build

echo "📦 numpy 사전 설치 (호환 가능한 버전)..."
pip install "numpy>=1.24.0" --no-build-isolation

echo "📦 pandas 설치 (numpy에 의존)..."
pip install "pandas>=2.0.0" --no-build-isolation

echo "📦 Python 3.13 호환성을 위한 SQLAlchemy 최신 버전 설치..."
pip install --upgrade sqlalchemy>=2.0.25

echo "📦 나머지 의존성 설치..."
pip install fastapi==0.104.1
pip install uvicorn==0.24.0
pip install pydantic==2.5.0
pip install pydantic-settings==2.1.0
pip install python-dotenv==1.0.0
pip install openai==1.3.0
pip install requests==2.31.0
pip install httpx==0.25.2
pip install python-multipart==0.0.6
pip install jinja2==3.1.2
pip install pydub==0.25.1
pip install speechrecognition==3.10.0
pip install pytz==2023.3
pip install schedule==1.2.0
pip install celery==5.3.4
pip install redis==5.0.1
pip install alembic==1.13.1
pip install psycopg2-binary==2.9.9

echo "✅ 의존성 설치 완료!"
echo "🧪 설치 확인..."
python -c "
import fastapi, uvicorn, pydantic, openai, requests, httpx, sqlalchemy
print('✅ 모든 핵심 패키지가 정상적으로 설치되었습니다!')
"

echo "🎉 Tasktory 의존성 문제 해결이 완료되었습니다!"
