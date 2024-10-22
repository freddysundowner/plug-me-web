import React, { useContext, useEffect, useState } from "react";
import TaskList from "../components/myaccount/TaskList";
import Drawer from "./Drawer";
import ChatContext from "../context/ChatContext";
import { getInvoice } from "../services/firebaseService";
import { useAuth } from "../context/AuthContext";
import DrawerContext from "../context/DrawerContext";
const TaskBoard = ({ isOpen = false, onClose = () => { } }) => {
  const [invoices, setInvoices] = useState([])
  const [currentTab, setCurrentTab] = useState("active");

  const { openDrawer, closeDrawer } = useContext(DrawerContext);
  const { taskBoardOpen, setIsTaskBoardOpen } = useContext(ChatContext)
  const { currentUser } = useAuth();
  useEffect(() => {
    getInvoice(
      currentUser?.uid,
    ).then((invoices) => {
      setInvoices(invoices)
    })
  }, [currentUser]);

  const taskClicked = (task) => {
    setIsTaskBoardOpen(false)
    let p = null;
    if (task?.sender?.id === currentUser?.id) {
      p = task?.receiver
    } else {
      p = task?.sender
    }
    openDrawer("chatDrawer", p, task?.thread, null, task?.thread);
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "active":
        return invoices.length == 0 ? <h2 className="text-center">No Tasks</h2> : <TaskList tasks={invoices} title="Current Tasks" callBack={taskClicked} />;
      case "completed":
        let paidTasks = invoices.filter((invoice) => invoice.status == "completed")
        return paidTasks.length == 0 ? <h2 className="text-center">No Tasks</h2> : <TaskList tasks={paidTasks} currentUserId={currentUser?.uid} />;
      case "archived":
        let pendingTasks = invoices.filter((invoice) => invoice.status == "pending")
        return pendingTasks.length == 0 ? <h2 className="text-center">No Tasks</h2> : <TaskList tasks={pendingTasks} />;
      case "closed":
        let closedTasks = invoices.filter((invoice) => invoice.status == "rejected")
        return closedTasks.length == 0 ? <h2 className="text-center">No Tasks</h2> : <TaskList tasks={closedTasks} title="Closed Tasks" />;
      default:
        return null;
    }
  };

  return (
    <Drawer
      title="My Tasks"
      isOpen={isOpen}
      onClose={onClose}
      subText="Manage tasks"
      width="w-2/3"
    >
      {" "}
      <div className="p-4">
        <div className="flex mb-4">
          <button
            onClick={() => setCurrentTab("active")}
            className={`text-lg font-semibold mr-10 ${currentTab === "active"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
              }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setCurrentTab("completed")}
            className={`text-lg font-semibold mr-10 ${currentTab === "completed"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
              }`}
          >
            Completed
          </button>
          <button
            onClick={() => setCurrentTab("archived")}
            className={`text-lg font-semibold mr-10 ${currentTab === "archived"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
              }`}
          >
            Pending
          </button>
          <button
            onClick={() => setCurrentTab("closed")}
            className={`text-lg font-semibold mr-4 ${currentTab === "closed"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
              }`}
          >
            Rejected
          </button>
        </div>
        <div className="overflow-y-auto max-h-[600px]">

          {renderTabContent()}
        </div>
      </div>
    </Drawer>
  );
};

export default TaskBoard;
