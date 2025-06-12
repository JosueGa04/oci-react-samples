# 🚀 TaskMaster

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Spring%20Boot-2.7.0-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-18.2.0-blue" alt="React">
</div>

## 📋 Descripción

TaskMaster es una potente aplicación de gestión de tareas y sprints que integra Telegram para una comunicación fluida y eficiente. Diseñada para equipos ágiles, TaskMaster simplifica la gestión de proyectos, el seguimiento de tareas y la colaboración en equipo.

## ✨ Características Principales

- 🤖 **Bot de Telegram Integrado**: Gestiona tareas directamente desde Telegram
- 📊 **Dashboard Interactivo**: Visualización en tiempo real del progreso del sprint
- 📱 **Interfaz Responsiva**: Accede desde cualquier dispositivo
- 📈 **Reportes Detallados**: Análisis de productividad y rendimiento
- 👥 **Gestión de Equipos**: Asignación y seguimiento de tareas por equipo
- ⚡ **Notificaciones en Tiempo Real**: Mantente informado de los cambios importantes

## 🛠️ Tecnologías

### Backend

- Java 11
- Spring Boot 2.7.0
- Spring Data JPA
- PostgreSQL
- Telegram Bot API

### Frontend

- React 18.2.0
- Material-UI
- Recharts
- Axios

## 🚀 Comenzando

### Prerrequisitos

- Java 11 o superior
- Node.js 14 o superior
- PostgreSQL 12 o superior
- Cuenta de Telegram

### Instalación

1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/taskmaster.git
```

2. Configura el backend

```bash
cd backend
./mvnw clean install
```

3. Configura el frontend

```bash
cd frontend
npm install
```

4. Configura las variables de entorno

```bash
# Backend (.env)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/taskmaster
SPRING_DATASOURCE_USERNAME=tu_usuario
SPRING_DATASOURCE_PASSWORD=tu_password
TELEGRAM_BOT_TOKEN=tu_token

# Frontend (.env)
REACT_APP_API_URL=http://localhost:8080
```

5. Inicia la aplicación

```bash
# Backend
./mvnw spring-boot:run

# Frontend
npm start
```

## 📱 Uso del Bot de Telegram

1. Busca el bot en Telegram: `@TaskMasterBot`
2. Inicia una conversación con `/start`
3. Comandos disponibles:
   - `/newtask` - Crear nueva tarea
   - `/mytasks` - Ver tus tareas asignadas
   - `/sprint` - Ver estado del sprint actual
   - `/help` - Ver todos los comandos disponibles

## 📊 Características del Dashboard

- **Vista General del Sprint**: Progreso y estado de las tareas
- **Estadísticas de Equipo**: Rendimiento y productividad
- **Gestión de Tareas**: Creación, asignación y seguimiento
- **Reportes Personalizados**: Análisis detallado de métricas

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 📞 Soporte

- 📧 Email: soporte@taskmaster.com
- 💬 Telegram: @TaskMasterSupport
- 🌐 Web: [www.taskmaster.com](https://www.taskmaster.com)

## 🙏 Agradecimientos

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

<div align="center">
  <sub>Built with ❤️ by TEAM 36</sub>
</div>
