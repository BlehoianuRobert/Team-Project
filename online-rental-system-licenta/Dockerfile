FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -e -B package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads/images && chown -R spring:spring /app
USER spring
EXPOSE 8081
ENV APP_UPLOADS_DIR=/app/uploads
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
