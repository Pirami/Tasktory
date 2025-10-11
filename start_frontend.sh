#!/bin/bash

echo "🚀 Tasktory 프론트엔드 실행을 시작합니다..."
echo "=" * 50

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요:"
    echo "brew install node"
    exit 1
fi

# npm 설치 확인
if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되어 있지 않습니다."
    exit 1
fi

echo "✅ Node.js 버전: $(node --version)"
echo "✅ npm 버전: $(npm --version)"

# 프론트엔드 디렉토리로 이동
cd frontend

# node_modules 확인 및 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 의존성 설치에 실패했습니다."
        exit 1
    fi
    echo "✅ 의존성 설치 완료"
else
    echo "✅ 의존성이 이미 설치되어 있습니다."
fi

# 환경 변수 파일 생성
if [ ! -f ".env" ]; then
    echo "⚙️ 환경 변수 파일을 생성합니다..."
    cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:8001
REACT_APP_VERSION=1.0.0
REACT_APP_NAME=Tasktory
DANGEROUSLY_DISABLE_HOST_CHECK=true
EOF
    echo "✅ .env 파일이 생성되었습니다."
else
    echo "⚠️ .env 파일이 이미 존재합니다."
    # 기존 .env 파일에 필요한 설정이 있는지 확인
    if ! grep -q "DANGEROUSLY_DISABLE_HOST_CHECK" .env; then
        echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" >> .env
        echo "✅ 호스트 체크 비활성화 설정을 추가했습니다."
    fi
    if ! grep -q "localhost:8001" .env; then
        sed -i '' 's/localhost:8000/localhost:8001/g' .env
        echo "✅ API URL을 포트 8001로 업데이트했습니다."
    fi
fi

echo ""
echo "🎯 프론트엔드 서버를 시작합니다..."
echo "브라우저에서 http://localhost:3000 으로 접속하세요."
echo ""
echo "백엔드 서버가 실행 중인지 확인하세요:"
echo "curl http://localhost:8001/health"
echo ""

# 개발 서버 시작
npm start
