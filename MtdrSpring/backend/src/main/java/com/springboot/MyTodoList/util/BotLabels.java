package com.springboot.MyTodoList.util;

public enum BotLabels {
	
	SHOW_MAIN_SCREEN("Show Main Screen", "/start"), 
	HIDE_MAIN_SCREEN("Hide Main Screen", "/hide"),
	LIST_ALL_ITEMS("List All Items", "/list"), 
	ADD_NEW_ITEM("Add New Item", "/add"),
	DONE("DONE", "/done"),
	UNDO("UNDO", "/undo"),
	DELETE("DELETE", "/delete"),
	MY_TODO_LIST("MY TODO LIST", "/todolist"),
	DASH("-", "-"),
	MY_ASSIGNED_ISSUES("My Assigned Issues", "/MyAssignedIssues"),
	COMPLETE_ISSUE("Complete Issue", "/CompleteIssue"),
	DEVELOPER_STATS("Developer Stats", "/DevStats"),
	CREATE_NEW_TASK("Create New Task", "/CreateTask"),
	ASSIGN_TASK("Assign Task", "/AssignTask"),
	SHOW_DEVELOPERS("Show Developers", "/ShowDevelopers");

	private final String displayText;
	private final String command;

	BotLabels(String displayText, String command) {
		this.displayText = displayText;
		this.command = command;
	}

	public String getDisplayText() {
		return displayText;
	}

	public String getCommand() {
		return command;
	}
}
