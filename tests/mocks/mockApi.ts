export class ApiService {
  getTodos = async (dummyParam: string, anotherDummyParam: number) => {
    await fetch('https://jsonplaceholder.typicode.com/todos/1');
  };
}
