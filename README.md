# 🛒DEHUV-SURVER
💬 Manage Configuration Easily with Us To Improve Your Project 

초보 개발자를 위해 프로젝트를 개선하고 우리와 함께 쉽게 구성을 관리를 할수있게 만든 프로젝트



## 팀원 구성


| **김동규** | **김영식** | **김진서** | **장태현** | **허웅** |
| :------: |  :------: | :------: | :------: | :------: |
| [<img src="https://github.com/woongheo1/devhub/blob/main/teamImages/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%80%E1%85%B2.png" height=150 width=150> <br/> @dongkyukim1](https://github.com/dongkyukim1) | [<img src="https://github.com/woongheo1/devhub/blob/main/teamImages/%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%89%E1%85%B5%E1%86%A8.png" height=150 width=150> <br/> @youngsik](https://github.com/zeroway3) | [<img src="https://github.com/woongheo1/devhub/blob/main/teamImages/%E1%84%8C%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A5.png" height=150 width=150> <br/> @jins0113](https://github.com/jins0113) | [<img src="https://github.com/woongheo1/devhub/blob/main/teamImages/%E1%84%90%E1%85%A2%E1%84%92%E1%85%A7%E1%86%AB.png" height=150 width=150> <br/> @TaeHyeon](https://github.com/xogus3492) | [<img src="https://github.com/woongheo1/devhub/blob/main/teamImages/%E1%84%8B%E1%85%AE%E1%86%BC.png" height=150 width=150> <br/> @woong](https://github.com/woongheo1)



### 💻프로젝트 개요
- [x] [💿서비스 시연 영상](#서비스-시연-영상)
- [x] [🎯서비스 핵심기능](#서비스-핵심기능)
- [x] [🛠기술 스택](#기술-스택)
- [x] [✨기술적 의사결정](#기술적-의사결정)
- [x] [🚧시스템 아키텍처](#시스템-아키텍처)
- [x] [📖ERD](#erd)
- [x] [노션](https://fluorescent-catsup-020.notion.site/Project-Management-3419363d672746dfb94ecf8838b13a2a?pvs=4)

<hr/>

### 💿서비스 시연 영상
<hr/>

### 🎯서비스 핵심기능
```
👨‍👨‍👧 회원 : 로그인 | 로그아웃 | 회원가입 | 이메일 인증 | 소셜 로그인(구글) 
🏡 나의프로젝트 : 저장소 이름 | 간단한 저장소 설명 | 수정 | 삭제
🏡 팀 프로젝트 :  프로젝트 만들기 | 프로젝트 목록 | 프로젝트 참가 | 팀원초대 | 레포지토리 생성 | AI 코드 리뷰 | 코드 검색 
💰 쪽지 보내기 : 받는 사람의 이메일 | 메세지 내용
💰 쪽지함 : 받은 쪽지함 | 보낸 쪽지함
🚧 AI 도우미 :  자동화된 작업처리 | 대화내역 저장  
📈 팀원구하기 : 게시판목록 | 게시판생성 | 게시판수정 | 게시판삭제 | 내게시판 조회
🏠 마이 페이지 : 비빌번호 변경 | 프로필 사진 변경 | 진행 사항조절 | 기록 | 팀목록 | 게시글 기록 | 쪽지함 | 결제 내역
```
<details>
<summary>핵심기능 #1. 이메일 발송</summary>
 
![fuction001](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8B%E1%85%B5%E1%84%86%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AF%20%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%8C%E1%85%B3%E1%86%BC.png)
- [x] `JavaMailSender`를 이용해 이메일 인증 및 임시 비밀번호 발송 기능을 구현하였습니다.
- [x] 휘발성 데이터인 이메일 인증 토큰의 경우 인메모리(In-Memory) 형태에 TTL(Time to Live) 특성을 지녀 유효기간이 설정된 `Redis` 기반의 Refresh Token으로 관리합니다. 사용자는 전송된 링크를 눌러 재접속하는 것만으로 이메일 인증을 완료할 수 있습니다.
</details>

<details>
<summary>핵심기능 #2. 구글 로그인</summary>

- [x] 일반 로그인의 경우 회원가입 양식 작성 후 이메일 인증을 거쳐야 하는 반면, 구글 로그인한 회원은 `해당 계정에서 불러온 이름 및 이메일 정보가 연동`돼 입력란을 채우며 나아가 별도의 이메일 인증 없이 곧바로 이용이 가능합니다.
</details>

<details>
<summary>핵심기능 #3. 쪽지 기능</summary>

- [x] 발신자가 쪽지를 발송 (수신자 이메일 존재 여부 확인)
- [x] 발신한 쪽지를 확인할 수 있는 보낸 쪽지함 기능
- [x] 수신한 쪽지를 확인할 수 있는 받은 쪽지함 기능 (읽지 않은 쪽지 개수 확인 포함)
- [x] 쪽지를 읽을 시 쪽지함에 읽음 표시 기능 
</details>
<details>
<summary>핵심기능 #4. ai 서비스</summary>
 
- [x] 웹사이트 방문자와  소통할 수 있는 무료 채팅 소프트웨어.
</details>
<details>
 
<summary>핵심기능 #5. 게시글 작성</summary>
 
- [x] 로컬 스토리지에 저장된 JWT 토큰을 사용하여 API로부터 작성자 정보를 가져와, `작성자 필드를 자동으로 채우고 읽기 전용`으로 설정한다.
</details>

<details>
<summary>핵심기능 #6. 나의 프로젝트</summary>

- [x] 자동 저장소 생성: 사용자로부터 저장소 이름과 설명을 입력받아 자동으로 개인 저장소를 생성합니다.
  
  - **질문 시퀀스**: 사용자에게 순차적으로 질문을 표시하여 입력을 유도합니다.
    
  - **입력 검증**: 입력된 내용이 유효한지 확인하고, 유효하지 않으면 시각적 피드백을 제공합니다.
    
  - **API 호출 및 리디렉션**: 입력이 완료되면 API를 통해 저장소를 생성하고, 성공 시 프로젝트 리스트 페이지로 자동 리디렉션됩니다.

</details>



<details>
<summary>핵심기능 #7. 팀 프로젝트</summary>

- [x] 사이드바 토글: 사용자는 사이드바를 손쉽게 열고 닫을 수 있습니다.
 
- [x] 로그아웃 기능: 사용자가 로그아웃할 때 서버와 통신하여 세션을 종료하고, 메인 페이지로 리디렉션합니다.
 
- [x] 사용자 정보 로딩: 로그인된 사용자의 정보를 API로 가져와 화면에 표시합니다.
  
- [x] 프로젝트 관리:
   
  - 개인 프로젝트 목록을 불러와 화면에 표시
    
  - 프로젝트 수정 및 삭제 기능 제공
    
  - 프로젝트 클릭 시 세부 정보 페이지로 이동

</details>
<details>
<summary>핵심기능 #8. 휴지통 이동</summary>

- [x]  팀/레포제포리 삭제 시 `휴지통`에 저장돼 `10일의 복구기한`이 주어지고, 자동 삭제됩니다.
- [x] 임의로 이동되는 경우에 대비하여 `삭제파일`를 명시하며, 관리자는 기한 내 이를 복구할 수 있는 권한이 있습니다.
</details>

|<small>회원가입</small>|<small>로그인<small>|<small>영어로변경</small>|
|:-:|:-:|:-:|
|![003](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%92%E1%85%AC%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%80%E1%85%A1%E1%84%8B%E1%85%B5%E1%86%B8%20%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.gif)|![004](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%85%E1%85%A9%E1%84%80%E1%85%B3%E1%84%8B%E1%85%B5%E1%86%AB.gif)|![005](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%8B%E1%85%A5%E1%84%85%E1%85%A9%E1%84%87%E1%85%A7%E1%86%AB%E1%84%80%E1%85%A7%E1%86%BC.gif)|
|<small><b>소셜로그인(구글)</b></small>|<small><b>나의프로젝트 생성</b></small>|<small><b>나의프로젝트 수정</b></small>|
|![006](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%AE%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%85%E1%85%A9%E1%84%80%E1%85%B3%E1%84%8B%E1%85%B5%E1%86%AB.gif)|![007](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A2%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%8C%E1%85%A6%E1%86%A8%E1%84%90%E1%85%B3%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC.gif)|![008](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A2%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%8C%E1%85%A6%E1%86%A8%E1%84%90%E1%85%B3%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.gif)|
|<small><b>나의프로젝트 삭제</b></small>|<small><b>쪽지 보내기</b></small>|<small><b>쪽지함</b></small>|
|![006](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A2%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%8C%E1%85%A6%E1%86%A8%E1%84%90%E1%85%B3%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.gif)|![007](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8D%E1%85%A9%E1%86%A8%E1%84%8C%E1%85%B5%E1%84%87%E1%85%A9%E1%84%82%E1%85%A2%E1%84%80%E1%85%B5.gif)|![008](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8D%E1%85%A9%E1%86%A8%E1%84%8C%E1%85%B5%E1%84%92%E1%85%A1%E1%86%B7.gif)|
|<small><b>쪽지 삭제</b></small>|<small><b>나의프로젝트 목록</b></small>|<small><b>로그아웃</b></small>|
|![009](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8D%E1%85%A9%E1%86%A8%E1%84%8C%E1%85%B5%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.gif)|![010](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A2%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%8C%E1%85%A6%E1%86%A8%E1%84%90%E1%85%B3%20%E1%84%86%E1%85%A9%E1%86%A8%E1%84%85%E1%85%A9%E1%86%A8.gif)|![011](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%85%E1%85%A9%E1%84%80%E1%85%B3%E1%84%8B%E1%85%A1%E1%84%8B%E1%85%AE%E1%86%BA.gif)|
|<small><b>설명서</b></small>|<small><b>커밋</b></small>|<small><b>이력 및 파일비교</b></small>|
|![012](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%89%E1%85%A5%E1%86%AF%E1%84%86%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A5.gif)|![013](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8F%E1%85%A5%E1%84%86%E1%85%B5%E1%86%BA.gif)|![014](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8F%E1%85%A9%E1%84%83%E1%85%B3%20%E1%84%8B%E1%85%B5%E1%84%85%E1%85%A7%E1%86%A8%20%E1%84%86%E1%85%B5%E1%86%BE%20%E1%84%87%E1%85%B5%E1%84%80%E1%85%AD.gif)|
|<small><b>AI 코드리뷰</b></small>|<small><b>다운로드</b></small>|<small><b>커밋 삭제</b></small>|
|![015](https://github.com/woongheo1/devhub/blob/main/images/ai%20%E1%84%8F%E1%85%A9%E1%84%83%E1%85%B3%E1%84%85%E1%85%B5%E1%84%87%E1%85%B2.gif)|![016](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%91%E1%85%A1%E1%84%8B%E1%85%B5%E1%86%AF%20%E1%84%83%E1%85%A1%E1%84%8B%E1%85%AE%E1%86%AB%E1%84%85%E1%85%A9%E1%84%83%E1%85%B3.gif)|![017](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8F%E1%85%A5%E1%84%86%E1%85%B5%E1%86%BA%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.gif)|
|<small><b>게시글 생성</b></small>|<small><b>게시글 상세보기</b></small>|<small><b>게시글 수정</b></small>|
|![012](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A6%E1%84%89%E1%85%B5%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC.gif)|![013](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A6%E1%84%89%E1%85%B5%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%89%E1%85%A1%E1%86%BC%E1%84%89%E1%85%A6%E1%84%87%E1%85%A9%E1%84%80%E1%85%B5.gif)|![014](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A6%E1%84%89%E1%85%B5%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.gif)|
|<small><b>게시글 삭제</b></small>|<small><b>게시글 검색</b></small>|<small><b>내 게시글 목록</b></small>
| ![015](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A6%E1%84%89%E1%85%B5%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.gif) | ![016](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A6%E1%84%89%E1%85%B5%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%80%E1%85%A5%E1%86%B7%E1%84%89%E1%85%A2%E1%86%A8.gif) | ![017](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%82%E1%85%A2%20%E1%84%80%E1%85%A6%E1%84%89%E1%85%B5%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%86%E1%85%A9%E1%86%A8%E1%84%85%E1%85%A9%E1%86%A8.gif) |
|<small><b>팀만들기</b></small>|<small><b>팀목록</b></small>|<small><b>프로젝트 참가<b></small>|
![018](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%90%E1%85%B5%E1%86%B7%20%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%8C%E1%85%A6%E1%86%A8%E1%84%90%E1%85%B3%20%E1%84%89%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A5%E1%86%BC%20%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.gif)|![019](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%90%E1%85%B5%E1%86%B7%20%E1%84%86%E1%85%A9%E1%86%A8%E1%84%85%E1%85%A9%E1%86%A8%20%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.gif)|![020](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%8C%E1%85%A6%E1%86%A8%E1%84%90%E1%85%B3%20%E1%84%8E%E1%85%A1%E1%86%B7%E1%84%80%E1%85%A1.gif)|
|<small><b>팀설정</b></small>|<small><b>팀원 초대</b></small>|<small><b>휴지통(복구,삭제)</b></small>|
|![023](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%90%E1%85%B5%E1%86%B7%E1%84%89%E1%85%A5%E1%86%AF%E1%84%8C%E1%85%A5%E1%86%BC.gif)|![024](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%90%E1%85%B5%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%8E%E1%85%A9%E1%84%83%E1%85%A2.gif)|![025](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%92%E1%85%B2%E1%84%8C%E1%85%B5%E1%84%90%E1%85%A9%E1%86%BC.gif)|
|<small><b>프로젝트 삭제 내역</b></small>|<small><b>환영 페이지</b></small>|<small><b>새 레포 만들기</b></small>|
![001](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6%20%E1%84%82%E1%85%A2%E1%84%8B%E1%85%A7%E1%86%A8.gif)|![026](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%92%E1%85%AA%E1%86%AB%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif)|![027](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%89%E1%85%A2%20%E1%84%85%E1%85%A6%E1%84%91%E1%85%A9%20%E1%84%86%E1%85%A1%E1%86%AB%E1%84%83%E1%85%B3%E1%86%AF%E1%84%80%E1%85%B5.gif)
|<small><b>ai 코드 리뷰</b></small>|<small><b>코드 검색</b></small>|<small><b>레포지토리 기능</b></small>|
![1](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8F%E1%85%A9%E1%84%83%E1%85%B3%20%E1%84%87%E1%85%AE%E1%86%AB%E1%84%89%E1%85%A5%E1%86%A8.gif)|![2](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%91%E1%85%A1%E1%84%8B%E1%85%B5%E1%86%AF%E1%84%80%E1%85%A5%E1%86%B7%E1%84%89%E1%85%A2%E1%86%A8.gif)|![3](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%85%E1%85%A6%E1%84%91%E1%85%A9%E1%84%8C%E1%85%B5%E1%84%90%E1%85%A9%E1%84%85%E1%85%B5%20%E1%84%80%E1%85%B5%E1%84%82%E1%85%B3%E1%86%BC.gif)
|<small><b>도움말</b></small>|<small><b>팀원초대</b></small>|<small><b></b>쪽지함</small>|
![4](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%83%E1%85%A9%E1%84%8B%E1%85%AE%E1%86%B7%E1%84%86%E1%85%A1%E1%86%AF.gif)|![5](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%86%E1%85%A2%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%90%E1%85%B5%E1%86%B7%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%8E%E1%85%A9%E1%84%83%E1%85%A2.gif)|![5](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%86%E1%85%A6%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%8D%E1%85%A9%E1%86%A8%E1%84%8C%E1%85%B5%E1%84%92%E1%85%A1%E1%86%B7.gif)
|<small>쪽지함 삭제<b></b></small>|<small>결제<b></b></small>|<small><b>해외결제</b></small>|
|![028](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8D%E1%85%A9%E1%86%A8%E1%84%8C%E1%85%B5%E1%84%92%E1%85%A1%E1%86%B7%20%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.gif)|![021](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A7%E1%86%AF%E1%84%8C%E1%85%A6.gif)|![022](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%92%E1%85%A2%E1%84%8B%E1%85%AC%E1%84%80%E1%85%A7%E1%86%AF%E1%84%8C%E1%85%A6.gif)|
|<small><b>AI 서비스</b></small>|<small><b>마이 페이지</b></small>|<small><b>프로필사진 변경</b></small>|
|![029](https://github.com/woongheo1/devhub/blob/main/images/ai%20%E1%84%89%E1%85%A5%E1%84%87%E1%85%B5%E1%84%89%E1%85%B3.gif)|![030](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%86%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.gif)|![031](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%91%E1%85%B5%E1%86%AF%E1%84%89%E1%85%A1%E1%84%8C%E1%85%B5%E1%86%AB%E1%84%87%E1%85%A7%E1%86%AB%E1%84%80%E1%85%A7%E1%86%BC.gif)|
|<small><b>비밀번호 번경</b></small>|<small><b>진행사항 조절</b></small>|<small><b>기록</b></small>|
|![032](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%87%E1%85%B5%E1%84%86%E1%85%B5%E1%86%AF%E1%84%87%E1%85%A5%E1%86%AB%E1%84%92%E1%85%A9%20%E1%84%87%E1%85%A7%E1%86%AB%E1%84%80%E1%85%A7%E1%86%BC.gif)|![033](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8C%E1%85%B5%E1%86%AB%E1%84%92%E1%85%A2%E1%86%BC%E1%84%89%E1%85%A1%E1%84%92%E1%85%A1%E1%86%BC%E1%84%8C%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%AF.gif)|![034](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%B5%E1%84%85%E1%85%A9%E1%86%A8.gif)|
|<small><b>팀 목록</b></small>|<small><b>게시글 기록</b></small>|<small><b>활동</b></small>|
|![035](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%90%E1%85%B5%E1%86%B7%E1%84%86%E1%85%A9%E1%86%A8%E1%84%85%E1%85%A9%E1%86%A8.gif)|![036](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A6%E1%84%89%E1%85%B5%E1%84%80%E1%85%B3%E1%86%AF%20%E1%84%80%E1%85%B5%E1%84%85%E1%85%A9%E1%86%A8.gif)|![037](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%92%E1%85%AA%E1%86%AF%E1%84%83%E1%85%A9%E1%86%BC.gif)|
|<small><b>결제</b></small>|<small><b>홈으로 가기</b></small>|
|![038](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%80%E1%85%A7%E1%86%AF%E1%84%8C%E1%85%A6%20%E1%84%82%E1%85%A2%E1%84%8B%E1%85%A7%E1%86%A8.gif)|![039](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%92%E1%85%A9%E1%86%B7%E1%84%8B%E1%85%B3%E1%84%85%E1%85%A9.gif)|

### 🛠기술 스택
OS | Windows 10, Mac
--- | --- |
Language | ![Java](https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white) ![Spring](https://img.shields.io/badge/spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Python](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=Python&logoColor=white)
IDE | ![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-007ACC?style=for-the-badge&logo=IntelliJ-IDEA&logoColor=white) ![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white) 
Framework | ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) [![Flask](https://img.shields.io/badge/Flask-007ACC?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
Build Tool | ![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=Gradle&logoColor=white)
Database | ![Mysql](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white) ![Redis](https://img.shields.io/badge/redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
Library | ![Spring Security](https://img.shields.io/badge/spring%20security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white) ![Thymeleaf](https://img.shields.io/badge/thymeleaf-005F0F?style=for-the-badge&logo=thymeleaf&logoColor=white) ![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-green?style=for-the-badge&logo=spring)
API | ![Java Mail](https://img.shields.io/badge/Java%20Mail-3a75b0?style=for-the-badge)  ![Iamport Payment](https://img.shields.io/badge/Iamport%20Payment-c1272d?style=for-the-badge) ![CKEditor 4](https://img.shields.io/badge/CKEditor%204-0287D0?style=for-the-badge&logo=ckeditor4&logoColor=white) ![Font Awesome](https://img.shields.io/badge/Font%20Awesome-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white) ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white) ![Swagger UI](https://img.shields.io/badge/Swagger_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black) ![REST API](https://img.shields.io/badge/REST%20API-blue?style=for-the-badge) ![JWT](https://img.shields.io/badge/JWT-34AA34?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![Auth0](https://img.shields.io/badge/Auth0-34AA34?style=for-the-badge&logo=auth0&logoColor=white) 
Server | ![Apache Tomcat 9.0](https://img.shields.io/badge/Apache%20Tomcat%20-F8DC75?style=for-the-badge&logo=apachetomcat&logoColor=black)
Version Control | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white) ![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=Notion&logoColor=white)


### ✨기술적 의사결정
선택기술 | 선택이유 및 근거
--- | --- |
`JWT` | 기존의 세션방식은 Stateful한 상태를 가지기 때문에 Stateless 즉, 사용자의 인증 정보를 가지고 있지 않게 하여 서버의 부담을 줄이고 확장성을 높였습니다. 또한, 특정 알고리즘과 암호화된 키로 인증 사용자 정보를 암호화하여 보안성이 보장된다는 점에서 JWT 토큰을 사용하게 되었습니다.
`AJAX` | AJAX는 서버에서 데이터를 비동기적으로 가져올 수 있어서 사용자 경험을 개선하고 네트워크 트래픽을 줄이는 데 유리하다고 판단했습니다. 또한, 실시간으로 페이지의 일부분만을 업데이트할 수 있어, 사용자 인터페이스의 반응성을 높여 동적이고 상호작용적인 웹 애플리케이션을 구축하기 위해 사용하게 되었습니다.
`WebSocket` | WebSocket은 서버가 클라이언트로부터 수신한 데이터를 즉각적으로 처리하고 전송에 최적화 되어 있습니다. 또한 HTTP 기반의 폴링(polling) 방식보다 훨씬 적은 오버헤드로 실시간 통신을 수행할 수 있다는 부분에서 실시간 쪽지 기능 구현에 WebSocket 방식을 채택했습니다.
`springdoc-opendapi(swagger)` | 애플리케이션에서 자동으로 API 문서를 생성해 주어 개발자가 일일이 문서를 작성하지 않아도 되므로, 생산성을 높여줍니다. 또한 직관적인 디자인으로 프론트엔드 개발자와 백엔드 개발자가 이해하기 쉬워 효율적인 커뮤니케이션이 가능하다고 생각했습니다.
`OAuth2(Social Login)` | 소셜 로그인을 제공하여 사용자들이 새로운 계정을 생성할 필요 없이 기존 계정으로 빠르게 로그인할 수 있어 사용자 경험을 향상시키기 위한 목적이 있습니다.
`OpenAI(Code Feedback)` | 초보 개발자를 타겟으로 한 서비스라는 점을 고려하여 개발자들이 더 나은 코드를 작성하도록 돕기 위해 코드 피드백 기능을 제공하게 되었습니다.


### 🚧시스템 아키텍처
![architecture](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8B%E1%85%A1%E1%84%8F%E1%85%B5%E1%84%90%E1%85%A6%E1%86%A8%E1%84%8E%E1%85%A7.jpeg)

### 📖ERD
![erd](https://github.com/woongheo1/devhub/blob/main/images/%E1%84%8E%E1%85%AC%E1%84%8C%E1%85%A9%E1%86%BC%E1%84%91%E1%85%B3%E1%84%85%E1%85%A9%E1%84%8C%E1%85%A6%E1%86%A8%E1%84%90%E1%85%B3%20erd.jpeg)
