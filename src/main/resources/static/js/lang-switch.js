document.getElementById('lang-switch').addEventListener('click', function() {
    const currentLang = document.getElementById('lang-switch').textContent.trim() === '영어로 변경' ? 'kr' : 'en';
    const newLang = currentLang === 'kr' ? 'en' : 'kr';

    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);

    window.location.href = url.toString();
});

window.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || 'kr'; // 기본값은 'kr'로 설정

    document.getElementById('lang-switch').textContent = lang === 'kr' ? '영어로 변경' : 'Switch to Korean';

    const elements = {
        '로그인': ['Login', '로그인'],
        '나의 프로젝트': ['My Projects', '나의 프로젝트'],
        '팀의 프로젝트': ['Team Projects', '팀의 프로젝트'],
        '팀원 구하기': ['Find Team Members', '팀원 구하기'],
        '쪽지 보내기': ['Send Messages', '쪽지 보내기'],
        '초대 하기': ['Invite', '초대 하기'],
        '아이디를 입력해주세요': ['Please enter your ID', '아이디를 입력해주세요'],
        '보내기': ['Submit', '보내기'],
        '더 쉽게, 더편하게': ['Easier and More Convenient', '더 쉽게, 더편하게'],
        'Months': ['Months', '월'],
        'Days': ['Days', '일'],
        'Hours': ['Hours', '시간'],
        'Minutes': ['Minutes', '분'],
        'Seconds': ['Seconds', '초'],
        '나만의 레포지토리': ['My Repository', '나만의 레포지토리'],
        '팀 레포지토리': ['Team Repository', '팀 레포지토리'],
        '회원가입': ['Register', '회원가입'],
        'Password Reset': ['Password Reset', '비밀번호 재설정']
    };

    document.querySelectorAll('a.nav-link, .modal-title, .form-control[placeholder], .countdown-text, .button_center__text, h1, small').forEach(el => {
        if (el.placeholder) {
            if (elements[el.placeholder]) {
                el.placeholder = lang === 'kr' ? elements[el.placeholder][1] : elements[el.placeholder][0];
            }
        } else {
            const originalText = el.textContent.trim();
            if (elements[originalText]) {
                el.innerHTML = lang === 'kr' ? elements[originalText][1] : elements[originalText][0];
            }
        }
    });
});
