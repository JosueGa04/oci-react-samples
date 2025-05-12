package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"Hello! I'm MyTodoList Bot!\nType a new todo item below and press the send button (blue arrow), or select an option below:"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the rigth-hand side."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	BYE("Bye! Select /start to resume!"),
	ENTER_TASK_TITLE("Please enter the task title:"),
	ENTER_TASK_DESCRIPTION("Please enter the task description:"),
	ENTER_TASK_ESTIMATION("Please enter the estimated hours for this task:"),
	ENTER_TASK_DUE_DATE("Please enter the due date (YYYY-MM-DD):"),
	ENTER_DEVELOPER_ID("Please enter the developer ID to assign this task:"),
	TASK_CREATED_SUCCESS("Task created successfully!"),
	INVALID_DATE_FORMAT("Invalid date format. Please use YYYY-MM-DD"),
	INVALID_NUMBER_FORMAT("Invalid number format. Please enter a valid number."),
	NOT_AUTHORIZED("You are not authorized to perform this action. Only Project Managers can create tasks."),
	DEVELOPER_LIST("Available Developers:\n"),
	SELECT_DEVELOPER("Please select a developer ID from the list above:"),
	TASK_CREATION_CANCELLED("Task creation cancelled."),
	TASK_CREATION_STARTED("Starting task creation process. Let's begin with the title."),
	SHOW_DEVELOPERS_HELP("Use /ShowDevelopers to see the list of available developers.");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
