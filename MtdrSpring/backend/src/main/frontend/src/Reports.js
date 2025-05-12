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

const API_URL = "/issues";
const USERS_URL = "/users";
const SPRINTS_URL = "/sprints";

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

  const renderCompletedTasksTable = () => {
    const tasksBySprint = getCompletedTasksBySprint();

    return (
      <TableContainer component={Paper}>
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
              fill="#c74634"
            />
            <Bar dataKey="hoursWorked" name="Hours Worked" fill="#312d2a" />
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
              fill="#c74634"
            />
            <Bar dataKey="hoursWorked" name="Hours Worked" fill="#312d2a" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#312d2a" }}>
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
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && renderCompletedTasksTable()}
        {currentTab === 1 && renderTeamKPIs()}
        {currentTab === 2 && renderIndividualKPIs()}
      </Box>
    </Box>
  );
};

export default Reports;
