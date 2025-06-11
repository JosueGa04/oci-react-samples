import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  alpha,
  Tabs,
  Tab,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const API_URL = "/issues";
const USERS_URL = "/users";
const SPRINTS_URL = "/sprints";

const oracleColors = [
  "#0072C6", // Blue
  "#D50000", // Red
  "#228B22", // Forest Green
  "#4B0082", // Indigo
  "#FF8C00", // Dark Orange
  "#A6A6A6", // Gray
  "#8B4513", // Saddle Brown
  "#2F4F4F", // Dark Slate Gray
  "#800080", // Purple
  "#006400", // Dark Green
];

const Reports = () => {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    fetchIssues();
    fetchUsers();
    fetchSprints();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setIssues(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch(SPRINTS_URL);
      const data = await response.json();
      setSprints(data);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.userId === userId);
    return user ? user.userName : "Unknown";
  };

  const getSprintTitle = (sprintId) => {
    const sprint = sprints.find((s) => s.idSprint === sprintId);
    return sprint ? sprint.sprintTitle : `Sprint ${sprintId}`;
  };

  const getCompletedTasksBySprint = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    const tasksBySprint = {};

    completedTasks.forEach((task) => {
      if (!task.idSprint) return;
      const sprint = sprints.find((s) => s.idSprint === task.idSprint);
      if (!tasksBySprint[task.idSprint]) {
        tasksBySprint[task.idSprint] = {
          sprintTitle: sprint ? sprint.sprintTitle : `Sprint ${task.idSprint}`,
          tasks: [],
        };
      }
      tasksBySprint[task.idSprint].tasks.push(task);
    });

    return tasksBySprint;
  };

  const getTeamKPIs = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    const teamKPIs = {};

    completedTasks.forEach((task) => {
      if (!task.team) return;
      if (!teamKPIs[task.team]) {
        teamKPIs[task.team] = {
          tasksCompleted: 0,
          hoursWorked: 0,
        };
      }
      teamKPIs[task.team].tasksCompleted++;
      teamKPIs[task.team].hoursWorked += task.hoursWorked || 0;
    });

    return Object.entries(teamKPIs).map(([team, data]) => ({
      team,
      ...data,
    }));
  };

  const getIndividualKPIs = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    const individualKPIs = {};

    completedTasks.forEach((task) => {
      if (!task.assignee) return;
      const userName = getUserName(task.assignee);
      if (!individualKPIs[userName]) {
        individualKPIs[userName] = {
          tasksCompleted: 0,
          hoursWorked: 0,
        };
      }
      individualKPIs[userName].tasksCompleted++;
      individualKPIs[userName].hoursWorked += task.hoursWorked || 0;
    });

    return Object.entries(individualKPIs).map(([name, data]) => ({
      name,
      ...data,
    }));
  };

  const getHoursPerSprint = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    const hoursBySprint = {};

    completedTasks.forEach((task) => {
      if (!task.idSprint) return;
      const sprint = sprints.find((s) => s.idSprint === task.idSprint);
      if (!hoursBySprint[task.idSprint]) {
        hoursBySprint[task.idSprint] = {
          sprintTitle: sprint ? sprint.sprintTitle : `Sprint ${task.idSprint}`,
          totalHours: 0,
        };
      }
      hoursBySprint[task.idSprint].totalHours += task.hoursWorked || 0;
    });

    return Object.values(hoursBySprint);
  };

  const getHoursWorkedByDeveloperPerSprint = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    const hoursByDeveloper = {};

    completedTasks.forEach((task) => {
      if (!task.idSprint || !task.assignee) return;
      const userName = getUserName(task.assignee);
      const sprint = sprints.find((s) => s.idSprint === task.idSprint);
      const sprintTitle = sprint
        ? sprint.sprintTitle
        : `Sprint ${task.idSprint}`;

      if (!hoursByDeveloper[task.idSprint]) {
        hoursByDeveloper[task.idSprint] = { sprintTitle, ...{} };
      }
      if (!hoursByDeveloper[task.idSprint][userName]) {
        hoursByDeveloper[task.idSprint][userName] = 0;
      }
      hoursByDeveloper[task.idSprint][userName] += task.hoursWorked || 0;
    });

    return Object.entries(hoursByDeveloper).map(([sprintId, devHours]) => ({
      sprintId,
      sprintTitle: devHours.sprintTitle,
      ...devHours,
    }));
  };

  const getCompletedTasksByDeveloperPerSprint = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    const tasksByDeveloper = {};

    completedTasks.forEach((task) => {
      if (!task.idSprint || !task.assignee) return;
      const userName = getUserName(task.assignee);
      const sprint = sprints.find((s) => s.idSprint === task.idSprint);
      const sprintTitle = sprint
        ? sprint.sprintTitle
        : `Sprint ${task.idSprint}`;

      if (!tasksByDeveloper[task.idSprint]) {
        tasksByDeveloper[task.idSprint] = { sprintTitle, ...{} };
      }
      if (!tasksByDeveloper[task.idSprint][userName]) {
        tasksByDeveloper[task.idSprint][userName] = 0;
      }
      tasksByDeveloper[task.idSprint][userName] += 1; // Contar la tarea completada
    });

    return Object.entries(tasksByDeveloper).map(([sprintId, devTasks]) => ({
      sprintId,
      sprintTitle: devTasks.sprintTitle,
      ...devTasks,
    }));
  };

  const getColorPalette = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 360) / numColors; // Espaciado uniforme en el círculo de colores
      colors.push(`hsl(${hue}, 70%, 50%)`); // Saturación y luminosidad ajustadas
    }
    return colors;
  };

  const getEstimationVsHoursData = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    // Group by sprint, then by task
    let data = [];
    completedTasks.forEach((task) => {
      if (!task.idSprint) return;
      const sprint = sprints.find((s) => s.idSprint === task.idSprint);
      data.push({
        sprintTitle: sprint ? sprint.sprintTitle : `Sprint ${task.idSprint}`,
        task: task.issueTitle,
        estimation: task.estimation || 0,
        hoursWorked: task.hoursWorked || 0,
      });
    });
    return data;
  };

  // Pie data for Estimation vs Hours Worked
  const getEstimationVsHoursPieData = () => {
    const completedTasks = issues.filter((issue) => issue.status === 1);
    let totalEstimation = 0;
    let totalHoursWorked = 0;
    completedTasks.forEach((task) => {
      totalEstimation += Number(task.estimation) || 0;
      totalHoursWorked += Number(task.hoursWorked) || 0;
    });
    return [
      { name: "Estimated Hours", value: totalEstimation },
      { name: "Actual Hours Worked", value: totalHoursWorked },
    ];
  };

  const renderCompletedTasksTable = () => {
    const tasksBySprint = getCompletedTasksBySprint();
    const pieData = getEstimationVsHoursPieData();
    const pieColors = ["#0072C6", "#D50000"];

    return (
      <>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sprint</TableCell>
                <TableCell>Task Name</TableCell>
                <TableCell>Developer</TableCell>
                <TableCell>Estimated Hours</TableCell>
                <TableCell>Actual Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(tasksBySprint).map(([sprintId, sprintData]) =>
                sprintData.tasks.map((task) => (
                  <TableRow key={task.issueId}>
                    <TableCell>{sprintData.sprintTitle}</TableCell>
                    <TableCell>{task.issueTitle}</TableCell>
                    <TableCell>{getUserName(task.assignee)}</TableCell>
                    <TableCell>{task.estimation}</TableCell>
                    <TableCell>{task.hoursWorked}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Estimation vs Hours Worked Pie Chart */}
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "#312d2a", fontWeight: 600 }}
        >
          Estimation vs Hours Worked (All Completed Tasks)
        </Typography>
        <Box
          sx={{
            height: 340,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </>
    );
  };

  const renderTeamKPIs = () => {
    const teamData = getTeamKPIs();

    return (
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={teamData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="team" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="tasksCompleted"
              name="Tasks Completed"
              fill={oracleColors[0]}
            />
            <Bar
              dataKey="hoursWorked"
              name="Hours Worked"
              fill={oracleColors[1]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderIndividualKPIs = () => {
    const individualData = getIndividualKPIs();

    return (
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={individualData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="tasksCompleted"
              name="Tasks Completed"
              fill={oracleColors[0]}
            />
            <Bar
              dataKey="hoursWorked"
              name="Hours Worked"
              fill={oracleColors[1]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderHoursPerSprint = () => {
    const sprintData = getHoursPerSprint();

    return (
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sprintData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sprintTitle" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="totalHours"
              name="Total Hours"
              fill={oracleColors[0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderHoursWorkedByDeveloperPerSprint = () => {
    const sprintData = getHoursWorkedByDeveloperPerSprint();
    const developers = Object.keys(sprintData[0] || {}).filter(
      (key) => key !== "sprintId" && key !== "sprintTitle"
    );

    return (
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sprintData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sprintTitle" />
            <YAxis />
            <Tooltip />
            <Legend />
            {developers.map((devName, index) => (
              <Bar
                key={devName}
                dataKey={devName}
                name={devName}
                fill={oracleColors[index % oracleColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  const renderCompletedTasksByDeveloperPerSprint = () => {
    const sprintData = getCompletedTasksByDeveloperPerSprint();
    const developers = Object.keys(sprintData[0] || {}).filter(
      (key) => key !== "sprintId" && key !== "sprintTitle"
    );

    return (
      <Box sx={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sprintData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sprintTitle" />
            <YAxis />
            <Tooltip />
            <Legend />
            {developers.map((devName, index) => (
              <Bar
                key={devName}
                dataKey={devName}
                name={devName}
                fill={oracleColors[index % oracleColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#312d2a",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Reports
      </Typography>

      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Completed Tasks by Sprint" />
        <Tab label="Team KPIs" />
        <Tab label="Individual KPIs" />
        <Tab label="Hours per Sprint" />
        <Tab label="Hours Worked by Developer per Sprint" />
        <Tab label="Completed Tasks by Developer per Sprint" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && renderCompletedTasksTable()}
        {currentTab === 1 && renderTeamKPIs()}
        {currentTab === 2 && renderIndividualKPIs()}
        {currentTab === 3 && renderHoursPerSprint()}
        {currentTab === 4 && renderHoursWorkedByDeveloperPerSprint()}
        {currentTab === 5 && renderCompletedTasksByDeveloperPerSprint()}
      </Box>
    </Box>
  );
};

export default Reports;
