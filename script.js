// 룰렛 항목 정의
const items = [
    '텀블러 캡',
    '10% 할인',
    '1+1 할인',
    '워터저그 할인',
    '무료 커피',
    '꽝, 한번더!'
];

// 캔버스와 컨텍스트 설정
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

// 룰렛 설정
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = Math.min(centerX, centerY) - 10;
let currentRotation = 0;
let isSpinning = false;

// 색상 배열 정의
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#96CEB4', '#FFEEAD', '#D4A5A5'
];

// 룰렛 그리기 함수
function drawWheel() {
    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 각 항목의 각도 계산
    const anglePerItem = (2 * Math.PI) / items.length;
    
    // 각 항목 그리기
    items.forEach((item, index) => {
        const startAngle = index * anglePerItem + currentRotation;
        const endAngle = startAngle + anglePerItem;
        
        // 섹터 그리기
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // 섹터 채우기
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        // 테두리 그리기
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 텍스트 그리기 (한글은 세로, 영문/숫자/기호는 가로)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerItem / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px NexonGothic';
        // 한글/영문 분리 함수
        function splitText(text) {
            const lines = [];
            let buffer = '';
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                // 한글 유니코드 범위: 0xAC00 ~ 0xD7A3
                if ((ch >= '\uAC00' && ch <= '\uD7A3') || /[가-힣]/.test(ch)) {
                    if (buffer) {
                        lines.push(buffer);
                        buffer = '';
                    }
                    lines.push(ch);
                } else if (ch === ' ') {
                    if (buffer) {
                        lines.push(buffer);
                        buffer = '';
                    }
                    lines.push(' ');
                } else {
                    buffer += ch;
                }
            }
            if (buffer) lines.push(buffer);
            return lines;
        }
        const lines = splitText(item);
        const lineHeight = 32;
        const totalHeight = lineHeight * lines.length;
        const baseRadius = radius * 0.65;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i],
                baseRadius,
                -totalHeight / 2 + i * lineHeight
            );
        }
        ctx.restore();
    });
}

// 룰렛 회전 함수
function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    
    // 랜덤 각도 생성 (5바퀴 + 랜덤 각도)
    const spinAngle = 5 * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const spinDuration = 5000; // 5초
    const startTime = Date.now();
    
    // 회전 애니메이션
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        
        if (elapsed < spinDuration) {
            // 이징 함수를 사용하여 부드러운 감속
            const progress = 1 - Math.pow(1 - elapsed / spinDuration, 3);
            currentRotation = spinAngle * progress;
            drawWheel();
            requestAnimationFrame(animate);
        } else {
            // 회전 종료
            currentRotation = spinAngle;
            drawWheel();
            isSpinning = false;
            spinBtn.disabled = false;
            
            // 결과 계산 및 표시
            const finalAngle = currentRotation % (2 * Math.PI);
            const itemIndex = Math.floor(items.length - (finalAngle / (2 * Math.PI) * items.length)) % items.length;
            const result = items[itemIndex];
            
            // 결과 표시
            const resultElement = document.getElementById('result');
            resultElement.textContent = `축하합니다! ${result}에 당첨되셨습니다!`;
            
            // 폭죽 효과
            if (result !== '꽝, 한번더!') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    }
    
    animate();
}

// 초기 룰렛 그리기
drawWheel();

// 시작 버튼 이벤트 리스너
document.getElementById('spinBtn').addEventListener('click', spinWheel); 