# Etapa de construcción (Build)
FROM maven:3.8.5-openjdk-11 AS maven_build

# Copiar archivos necesarios para la compilación
COPY pom.xml /tmp/
COPY src /tmp/src/

# Establecer directorio de trabajo
WORKDIR /tmp/

# Construir el proyecto con cache de dependencias
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests

# Etapa de ejecución (Run)
FROM openjdk:11-jre-slim

# Puerto expuesto por la aplicación
EXPOSE 8080

# Copiar el archivo .jar desde la etapa de build
COPY --from=maven_build /tmp/target/MyTodoList-0.0.1-SNAPSHOT.jar /app/app.jar

# Comando que ejecuta el backend
CMD ["java", "-jar", "/app/app.jar"]
