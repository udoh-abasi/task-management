"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { TaskType, UserInterface } from "../(utils)/TSInterface";
import { RiRectangleFill } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Footer from "../(utils)/Footer";
import {
  deleteSession,
  getUser,
} from "../(serverActions)/authenticationActions";
import { useRouter } from "next/navigation";
import { IoMdAddCircle } from "react-icons/io";
import { Separator } from "@/components/ui/separator";
import { AiFillWarning } from "react-icons/ai";
import Loader from "../(utils)/loader";
import {
  addTask,
  deleteTask,
  getAllTask,
  markTaskAsComplete,
} from "../(serverActions)/taskAction";

const getIndicatorColor = (
  status: TaskType["status"],
  priority: TaskType["priority"]
) => {
  if (status === "completed") return "text-green-600";
  if (priority === "low") return "text-blue-500";
  if (priority === "medium") return;

  // If we get here, that means priority is high
  return "text-red-600";
};

const Dashboard = () => {
  const [data, setData] = useState<TaskType[]>([]);

  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "inprogress"
  >("all");

  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  // Use useMemo to cache (memoize) the result, so that on re-renders, this 'columns' variable will not re-run except 'data' value has changed
  const columns: ColumnDef<TaskType>[] = useMemo(() => {
    return [
      {
        id: "indicators",
        // Leave the header empty
        header: ({}) => <p></p>,

        cell: ({ row }) => {
          const theRow = row.original;
          const indicatorColor = getIndicatorColor(
            theRow.status,
            theRow.priority
          );
          return <RiRectangleFill className={`${indicatorColor} text-3xl`} />;
        },

        enableSorting: false,
        enableHiding: false,
      },

      {
        accessorKey: "task",
        header: ({ column }) => {
          return (
            <Button
              variant="default"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="uppercase font-bold text-lg rounded-2xl group"
              title="Click to sort"
            >
              Task
              <ArrowUpDown className="ml-2 h-4 w-4 group-hover:-translate-y-1 duration-500 ease-linear" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const theText = row.getValue("task") as string;

          // Here, CSS's property 'text-transform: capitalize' capitalizes every first text in each word. I want just the first letter of the first word to be capitalized
          const makeFirstLetterUppercase =
            theText.charAt(0).toUpperCase() + theText.slice(1).toLowerCase();

          return (
            <div className="hover:cursor-default">
              {makeFirstLetterUppercase}
            </div>
          );
        },
        enableHiding: false,
      },

      {
        accessorKey: "status",
        header: ({}) => (
          <p
            className="uppercase font-bold text-lg text-center"
            id="gradient-text"
          >
            Status
          </p>
        ),
        cell: ({ row }) => {
          return (
            <div className="capitalize text-center">
              {row.getValue("status")}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },

      {
        accessorKey: "priority",
        header: ({}) => (
          <p
            className="uppercase font-bold text-lg text-center"
            id="gradient-text"
          >
            Priority
          </p>
        ),
        cell: ({ row }) => {
          return (
            <div className="capitalize text-center">
              {row.getValue("priority")}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },

      {
        id: "actions",
        cell: ({ row }) => {
          const eachTask = row.original;

          return (
            <div>
              {eachTask.status === "inprogress" && (
                <button
                  type="button"
                  onClick={async () => {
                    // Optimistically mark data as complete
                    // Map through all the data and update the one that has the same id with the task that it 'mark as complete' button was clicked
                    const newData: TaskType[] = data.map((eachData) => {
                      if (eachData._id === eachTask._id) {
                        return { ...eachData, status: "completed" };
                      }

                      return { ...eachData };
                    });

                    setData([...newData]);

                    // Send request to backend to mark data as complete
                    await markTaskAsComplete(
                      eachTask._id as string,
                      eachTask.owner
                    );
                  }}
                  className="relative block px-2 py-1 group my-3 mx-auto"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-green-600  group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                  <span className="absolute inset-0 w-full h-full bg-white border-2 border-green-600 group-hover:bg-green-600"></span>
                  <span className="relative text-black group-hover:text-white text-xs">
                    Mark as complete
                  </span>
                </button>
              )}

              <button
                className="relative block  px-2 py-1 group mx-auto"
                type="button"
                onClick={async () => {
                  // Optimistically delete data
                  const newData = data.filter(
                    (theData) => theData._id !== eachTask._id
                  );

                  setData([...newData]);

                  // Send request to backend to delete data
                  await deleteTask(eachTask._id as string, eachTask.owner);
                }}
              >
                <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-red-600 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                <span className="absolute inset-0 w-full h-full bg-white border-2 border-red-600 group-hover:bg-red-600"></span>
                <span className="relative text-black group-hover:text-white text-xs">
                  Delete
                </span>
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ];
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,

      // NOTE: Here, use useMemo, if not there will be an infinite re-rendering
      globalFilter: useMemo(
        () => ({ status: statusFilter, priority: priorityFilter }),
        [statusFilter, priorityFilter]
      ),
    },

    globalFilterFn: (row) => {
      // Here, if we return true, the row will be kept, but if we return false, the row will not be kept in the final display
      const matchesStatus =
        statusFilter === "all" || row.getValue("status") === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || row.getValue("priority") === priorityFilter;

      return matchesStatus && matchesPriority;
    },
  });

  function getEmailPrefix(email: string | undefined) {
    if (email) {
      // Match everything before the first '.' or '@' (if the @ comes before the .)
      const match = email.match(/^[^.@]+/);
      return match ? match[0] : "";
    }
    return "";
  }

  const [task, setTask] = useState("");
  const [priority, setPriority] = useState<TaskType["priority"] | "">("");

  const [dataLoading, setDataLoading] = useState(true);
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [errorAddingTask, setErrorAddingTask] = useState("");

  const [user, setUser] = useState<UserInterface>();

  useEffect(() => {
    const getData = async () => {
      const user = await getUser();

      if (!user?._id) {
        router.push("/");
      } else if (user.email) {
        setUser(user);

        // Send request to get all the user's task, using the user's ID
        const allData = await getAllTask(user._id);
        setData([...allData]);
        setDataLoading(false);
      }
    };

    getData();
  }, [router]);

  return (
    <main className="min-h-screen max-w-[1200px] mx-auto flex flex-col">
      {dataLoading ? (
        <div className="flex-grow grid place-items-center">
          <Loader />
        </div>
      ) : (
        <section className="flex-grow">
          <nav className="p-2 pt-4">
            <ul className="flex gap-2 justify-end">
              <li>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteSession();
                    router.push("/");
                  }}
                  className="inline-flex font-bold items-center justify-center px-1 py-1 w-[150px] text-sm min-[480px]:text-base min-[480px]:w-[200px] min-[480px]:px-3 text-center text-indigo-100 border border-indigo-500 rounded-lg shadow-sm cursor-pointer hover:text-white bg-gradient-to-br from-purple-500 via-indigo-500 to-indigo-500"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>

          <h1
            id="gradient-text"
            className="animated my-8 mx-6 text-[7vw] font-bold min-[870px]:text-[60px] capitalize"
          >
            Welcome {getEmailPrefix(user?.email)}
          </h1>

          <form className="my-8 mx-6 p-4 ring-4 ring-[#4b0082] rounded-tr-3xl rounded-bl-3xl">
            <div>
              <div className="flex gap-4 justify-center">
                <Input
                  placeholder="Task..."
                  type="text"
                  name="task"
                  value={task}
                  onChange={(e) => {
                    setErrorAddingTask("");
                    setTask(e.target.value);
                  }}
                  required
                  className="w-full flex-[0_1_700px] ring-1 ring-black disabled:cursor-not-allowed"
                  disabled={addTaskLoading}
                />

                <Select
                  name="priority"
                  required
                  value={priority}
                  onValueChange={(e: TaskType["priority"]) => {
                    setErrorAddingTask("");
                    setPriority(e);
                  }}
                  defaultValue=""
                  disabled={addTaskLoading}
                >
                  <SelectTrigger
                    className="w-[95px] mx-2 text-sm ring-1 ring-black disabled:cursor-not-allowed"
                    aria-required
                  >
                    <SelectValue placeholder="Priority" aria-required />
                  </SelectTrigger>

                  <SelectContent aria-required>
                    <SelectItem value="high">High</SelectItem>

                    <SelectItem value="medium">Medium</SelectItem>

                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                type="submit"
                className="relative block px-2 py-1 group my-3 mx-auto w-full max-w-[400px] disabled:cursor-not-allowed"
                disabled={addTaskLoading}
                onClick={async (e) => {
                  e.preventDefault(); // Prevent default form submission

                  if (!addTaskLoading) {
                    if (!task) {
                      setErrorAddingTask("Task is required");
                      return;
                    }

                    if (!priority) {
                      setErrorAddingTask("A priority level must be selected");
                      return;
                    }

                    if (user?._id) {
                      setAddTaskLoading(true);

                      const result = await addTask(
                        user._id as string,
                        task,
                        priority
                      );

                      if (!result?.user) {
                        // Push the user to the log in page
                        router.push("/");
                      }

                      if (!result?.addedTask) {
                        setErrorAddingTask("Something went wrong");
                        return;
                      }

                      setData([result.addedTask, ...data]);

                      setTask("");
                      setPriority("");
                      setErrorAddingTask("");
                      setAddTaskLoading(false);
                    }
                  }
                }}
              >
                <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-purple-600  group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                <span className="absolute inset-0 w-full h-full bg-white border-2 border-purple-600 group-hover:bg-purple-600"></span>
                <span className="relative text-black group-hover:text-white text-lg font-bold uppercase flex justify-center items-center gap-1">
                  <span className="flex items-center gap-2">
                    {addTaskLoading ? (
                      <Loader />
                    ) : (
                      <span>
                        Add Task <IoMdAddCircle className="text-xl inline" />
                      </span>
                    )}
                  </span>
                </span>
              </button>

              {errorAddingTask && (
                <p className="flex items-center justify-center text-sm text-red-600 font-bold mt-4">
                  <AiFillWarning className="text-2xl" />
                  {errorAddingTask}
                </p>
              )}
            </div>
          </form>

          <Separator className="mb-4 mt-16" />

          <div className="w-full p-8">
            <div className="flex items-center justify-between py-4">
              <Input
                placeholder="Search for a task..."
                type="text"
                value={
                  (table.getColumn("task")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("task")?.setFilterValue(event.target.value)
                }
                className="max-w-sm ring-2 ring-black"
              />

              <Select
                onValueChange={(e: "all" | "low" | "medium" | "high") => {
                  setPriorityFilter(e);
                }}
              >
                <SelectTrigger className="w-[95px] mx-2 text-sm ring-2 ring-black">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All</SelectItem>

                  <SelectItem value="high">High</SelectItem>

                  <SelectItem value="medium">Medium</SelectItem>

                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(e: "all" | "completed" | "inprogress") => {
                  setStatusFilter(e);
                }}
              >
                <SelectTrigger className="w-[130px] text-sm ring-2 ring-black">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All</SelectItem>

                  <SelectItem value="inprogress">Inprogress</SelectItem>

                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      return (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No task found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};

export default Dashboard;
