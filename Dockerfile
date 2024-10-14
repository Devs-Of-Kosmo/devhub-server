# 베이스 이미지 설정
FROM amazoncorretto:17 AS builder

# Gradle 및 소스 코드 복사
WORKDIR /app
COPY . .

# Gradle 빌드 실행 (테스트 제외)
RUN ./gradlew clean build -x test

# 최종 이미지
FROM amazoncorretto:17

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 컨테이너가 실행될 때 Java 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]