import { test } from "../base/baseTest";

const todos = ["Buy groceries", "Walk the dog", "Write tests"];

test("Add three todos and check them off", async ({ todoPage }) => {
  await test.step("Navigate to the TodoMVC app", async () => {
    await todoPage.goto();
  });

  await test.step("Add three todo items", async () => {
    await todoPage.addTodos(todos);
    await todoPage.assertTodoCount(todos.length);
    await todoPage.assertTodoTitles(todos);
  });

  await test.step("Check off all todo items", async () => {
    await todoPage.completeAllTodos();
    await todoPage.assertAllCompleted();
  });
});
