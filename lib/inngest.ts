import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "linknest" });

export const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "test/hello" }] },
  async ({ event }: { event: { data: { name?: string } } }) => {
    return { message: `Hello, ${event.data.name ?? "world"}!` };
  }
);
